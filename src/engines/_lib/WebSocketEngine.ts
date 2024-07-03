import type { Promisable, ValueOf } from "type-fest";
import type { WebSocket as WsWebSocket } from "ws";
import {
  getTimeoutSignal,
  makeAbortApi,
  mutex,
  SerialId,
  throwIfAborted,
} from "~/_internal";
import {
  ConnectionUnavailable,
  DatabaseConflict,
  MissingNamespace,
  NamespaceConflict,
  RpcResponseError,
  SurrealTypeError,
  unreachable,
  WebSocketEngineError,
} from "~/errors";
import { isArrayBuffer, Payload } from "~/formatters";
import type {
  BidirectionalRpcResponse,
  RpcParams,
  RpcRequest,
  RpcResult,
} from "~/index/types";
import EngineAbc, {
  CLOSED,
  CLOSING,
  CONNECTING,
  type EngineConfig,
  OPEN,
} from "./Abc";

type GlobalWebSocket = typeof globalThis extends
  { WebSocket: new(...args: any) => infer R } ? R
  : never;

/**
 * WebSocket インスタンスを作成する関数。
 */
export interface CreateWebSocket {
  /**
   * WebSocket インスタンスを作成します。
   *
   * @param address 接続先の URL。
   * @param protocol サブプロトコル。
   * @returns WebSocket インスタンス。
   */
  (
    address: URL,
    protocol: string | undefined,
  ): Promisable<GlobalWebSocket | WsWebSocket>;
}

/**
 * WebSocket エンジンの設定。
 */
export interface WebSocketEngineConfig extends EngineConfig {
  /**
   * WebSocket インスタンスを作成する関数。
   */
  readonly createWebSocket: CreateWebSocket;
  /**
   * ping メッセージを送信する間隔 (ミリ秒)。
   *
   * @default 30_000
   */
  readonly pingInterval?: number | undefined;
  /**
   * エベントエミッターを介して通知できないエラーを捕捉する関数。
   *
   * @param error 投げられたエラー
   * @default console.error
   */
  readonly onCaughtError?: (error: unknown) => void;
}

/**
 * WebSocket エンジン。
 */
export default class WebSocketEngine extends EngineAbc {
  /**
   * 増分 ID を生成するためのインスタンス。
   */
  protected id = new SerialId();

  /**
   * WebSocket インスタンス。
   */
  protected ws: WsWebSocket | null = null;

  /**
   * WebSocket インスタンスを作成する関数。
   */
  protected newWs: CreateWebSocket;

  /**
   * ping メッセージを送信する間隔 (ミリ秒)。
   */
  readonly pingInterval: number;

  /**
   * エベントエミッターを介して通知できないエラーを捕捉する関数。
   */
  readonly onCaughtError: (error: unknown) => void;

  /**
   * @param config WebSocket エンジンの設定。
   */
  constructor(config: WebSocketEngineConfig) {
    super(config);
    this.newWs = config.createWebSocket;
    this.pingInterval = Math.max(1_000, config.pingInterval ?? 30_000);
    this.onCaughtError = config.onCaughtError || console.error;
  }

  @mutex
  async connect(endpoint: URL, timeoutSignal: AbortSignal): Promise<void> {
    if (this.state === OPEN) {
      return;
    }

    if (this.state !== CLOSED) {
      unreachable();
    }

    await this.transition(
      {
        state: CONNECTING,
        endpoint,
      },
      () => CLOSED,
    );
    const [signal, abort] = makeAbortApi(timeoutSignal);
    const openOrError = [
      this.ee.once(OPEN, { signal }),
      this.ee.once("error", { signal }),
    ];
    const ws = await this.newWs(
      new URL(endpoint),
      this.fmt.wsFormat,
    ) as WsWebSocket;
    ws.addEventListener("error", evt => {
      this.ee.emit(
        "error",
        new WebSocketEngineError(
          3000,
          /**
           * イベントに message プロパティが含まれているかどうかは分かりません。
           *
           * - Mozilla: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event#event_type
           * - Node.js:
           *     - undici: https://github.com/nodejs/undici/blob/v6.18.1/types/websocket.d.ts#L127-L133
           *     - ws: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ws/index.d.ts#L289-L294
           * - Deno: https://github.com/denoland/deno/blob/v1.43.6/ext/web/02_event.js#L1064-L1133
           */
          evt.message != null
            ? "The \"error\" event was caught."
            : String(evt.message),
          {
            ...(evt.error == null ? {} : { cause: evt.error }),
            fatal: true,
          },
        ),
      );
    });
    ws.addEventListener("close", async evt => {
      this.ws = null;
      this.id.reset();

      switch (evt.code) {
        case 1000: // Normal Closure
        case 1004: // Reserved (Not Used)
        case 1005: // No Status Received
        // 早期切断に由来するエラーコードをエラーとして扱いません。
        case 1001: // Going Away
        case 1006: // Abnormal Closure
          break;

        case 1002: // Protocol Error
        case 1003: // Unsupported Data
        case 1007: // Invalid Frame Payload Data
        case 1008: // Policy Violation
        case 1009: // Message Too Big
        case 1010: // Mandatory Extension
        case 1011: // Internal Server Error
        case 1012: // Service Restart
        case 1013: // Try Again Later
        case 1014: // Bad Gateway
        case 1015: // TLS Handshake
          this.ee.emit(
            "error",
            new WebSocketEngineError(evt.code, evt.reason),
          );
      }

      try {
        await this.transition(CLOSED, () => CLOSED);
      } catch (error) {
        this.onCaughtError(error);
      }
    });
    ws.addEventListener("open", async () => {
      try {
        this.ws = ws;
        await this.transition(
          {
            state: OPEN,
            endpoint,
          },
          () => {
            this.ws = null;

            return CLOSED;
          },
        );
      } catch (error) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            // open イベントハンドラー内で発生したエラーを、
            // カスタムエラーコード 3001 として報告します。
            3001,
            "An error occurred within the handler for the \"open\" event.",
            {
              cause: error,
              fatal: true,
            },
          ),
        );
      }
    });
    ws.addEventListener("message", async evt => {
      try {
        const payload = new Payload(evt.data);
        const decoded = await this.fmt.decode(payload);
        const rpcResp = this.v8n.parseRpcResponse(decoded, {
          endpoint: new URL(endpoint),
          engineName: "websocket",
        });

        if ("id" in rpcResp) {
          this.ee.emit(`rpc/${rpcResp.id}`, rpcResp);
        } else if ("result" in rpcResp) {
          const {
            id,
            ...liveResult
          } = this.v8n.parseLiveResult(rpcResp.result, {
            endpoint: new URL(endpoint),
            engineName: "websocket",
          });
          this.ee.emit(`live/${id}`, liveResult);
        } else {
          throw new RpcResponseError(rpcResp, {
            cause: {
              endpoint: new URL(endpoint),
            },
          });
        }
      } catch (error) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            // message イベントハンドラー内で発生したエラーを、
            // カスタムエラーコード 3002 として報告します。
            3002,
            "An error occurred within the handler for the \"message\" event.",
            {
              cause: error,
              fatal: false,
            },
          ),
        );
      }
    });

    const [result] = await Promise.race(openOrError);
    abort();

    if (result instanceof Error) {
      throw result;
    }

    if ("error" in result) {
      throw result.error;
    }

    const pingTimeoutMs = Math.min(this.pingInterval, 5_000);
    let pinger: any = setInterval(async () => {
      try {
        const signal = getTimeoutSignal(pingTimeoutMs);
        const request: RpcRequest = { method: "ping", params: [] };
        const rpcResp = await this.rpc(request, signal);

        if (rpcResp.error) {
          throw new RpcResponseError(rpcResp, {
            cause: {
              endpoint: new URL(endpoint),
            },
          });
        }
      } catch (error) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            // ping メッセージの送信に失敗したエラーを、
            // カスタムエラーコード 3003 として報告します。
            3003,
            "Failed to send a ping message.",
            {
              cause: error,
              fatal: false,
            },
          ),
        );
      }
    }, this.pingInterval);
    this.ee.on(CLOSING, () => {
      clearInterval(pinger);
      pinger = undefined;
    });
  }

  @mutex
  async disconnect(signal: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const conn = this.getConnectionInfo();
    const close = async () => {
      const closed = this.ee.once(CLOSED, { signal });

      if (
        this.ws
        && this.ws.readyState !== CLOSED
        && this.ws.readyState !== CLOSING
      ) {
        this.ws.close();
      } else {
        this.ee.emit(CLOSED, {
          state: CLOSED,
        });
      }

      const [result] = await closed;

      if ("error" in result) {
        throw result.error;
      }
    };

    switch (conn.state) {
      case OPEN:
        await this.transition(
          {
            state: CLOSING,
            endpoint: conn.endpoint,
          },
          () => ({
            state: CLOSING,
            endpoint: conn.endpoint,
          }),
        );
        throwIfAborted(signal);
        await close();

        break;

      case CLOSING:
        await close();

        break;

      case CLOSED:
        break;

      default:
        unreachable();
    }
  }

  async rpc(
    request: RpcRequest,
    signal: AbortSignal,
  ): Promise<BidirectionalRpcResponse> {
    if (this.state === CONNECTING) {
      await this.ee.once(OPEN, { signal });
    }

    // 接続情報のスナップショットを取得します。
    // 以降、接続情報を参照する際はこれを使用します。
    const conn = this.getConnectionInfo();

    if (!this.ws || conn.state !== OPEN) {
      throw new ConnectionUnavailable();
    }

    request = this.v8n.parseRpcRequest(request, {
      endpoint: new URL(conn.endpoint),
      engineName: "websocket",
    });

    switch (request.method) {
      case "use": {
        const [ns, db] = request.params;

        if (!conn.ns && !ns && db) {
          throw new MissingNamespace();
        }

        break;
      }

      case "query": {
        const [arg0, vars] = request.params;
        const { text, vars: varsBase } = typeof arg0 === "string"
          ? { text: arg0, vars: {} }
          : arg0;
        request = {
          method: request.method,
          params: [text, { ...varsBase, ...vars }],
        };

        break;
      }
    }

    const id: BidirectionalRpcResponse["id"] =
      `${request.method}/${this.id.next()}`;
    const body: unknown = await this.fmt.encode({ ...request, id });

    if (typeof body !== "string" && !isArrayBuffer(body)) {
      throw new SurrealTypeError(
        "The formatter encoded a non-string, non-ArrayBuffer value",
      );
    }

    const response = this.ee.once(`rpc/${id}`, { signal });
    this.ws.send(body);
    const [rawResp] = await response;
    // `rawResp` は message イベントハンドラー内で検証済みなので、ここでは型でキャストするだけです。
    const rpcResp = rawResp as BidirectionalRpcResponse;

    if ("result" in rpcResp) {
      const rpc = {
        method: request.method,
        params: request.params,
        result: this.v8n.parseRpcResult(rpcResp.result, {
          request,
          endpoint: new URL(conn.endpoint),
          engineName: "websocket",
        }),
      } as ValueOf<
        {
          [M in (typeof request)["method"]]: {
            method: M;
            params: RpcParams<M>;
            result: RpcResult<M>;
          };
        }
      >;

      switch (rpc.method) {
        case "use": {
          const [ns, db] = rpc.params;

          if (ns) {
            if (this.namespace !== conn.ns) {
              throw new NamespaceConflict(this.namespace, conn.ns);
            }

            this.namespace = ns;
          }

          // `.rpc` メソッドの実行開始直後のデータベースから変更がなければ更新する。
          if (db) {
            if (this.database !== conn.db) {
              throw new DatabaseConflict(this.database, conn.db);
            }

            this.database = db;
          }

          break;
        }

        case "signin":
        case "signup":
          this.token = rpc.result;

          break;

        case "authenticate": {
          [this.token] = rpc.params;

          break;
        }

        case "invalidate":
          this.token = null;

          break;
      }
    }

    return rpcResp;
  }
}
