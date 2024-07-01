import type { Promisable, ValueOf } from "type-fest";
import type { WebSocket as WsWebSocket } from "ws";
import { makeAbortApi } from "~/_internal";
import { type Err, err, mutex, type Ok, ok, SerialId } from "~/_internal";
import getTimeoutSignal from "~/_internal/timeoutSignal";
import {
  ConnectionUnavailable,
  MissingNamespace,
  RpcResponseError,
  SurrealDbTypeError,
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
   * @param config WebSocket エンジンの設定。
   */
  constructor(config: WebSocketEngineConfig) {
    super(config);
    this.newWs = config.createWebSocket;
    this.pingInterval = Math.max(1_000, config.pingInterval ?? 30_000);
  }

  @mutex
  async connect(endpoint: URL, timeoutSignal: AbortSignal): Promise<void> {
    if (this.state === OPEN) {
      return;
    }

    this.conn.endpoint = endpoint = new URL(endpoint); // copy
    await this.setState(CONNECTING, () => {
      this.conn = {};

      return CLOSED;
    });

    const [signal, abort] = makeAbortApi(timeoutSignal);
    const openOrError = Promise.race([
      this.ee.once(OPEN, { signal }),
      this.ee.once("error", { signal }),
    ]);
    const ws = await this.newWs(
      new URL(endpoint),
      this.fmt.protocol,
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
          "message" in evt && evt.message != null
            ? String(evt.message)
            : "The \"error\" event was caught.",
          {
            ...("error" in evt ? { cause: evt.error } : {}),
            fatal: true,
          },
        ),
      );
    });
    ws.addEventListener("close", async evt => {
      this.id = new SerialId();
      this.ws = null;
      this.conn = {};

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
        await this.setState(CLOSED, () => CLOSED);
      } catch {
        // Ignore
        // CLOSED エベントのエラーハンドリングは、このエンジンを使用する Surreal クラス
        // が行うことを期待します。
      }
    });
    ws.addEventListener("open", async () => {
      try {
        this.ws = ws;
        await this.setState(OPEN, () => {
          this.ws = null;
          this.conn = {};

          return CLOSED;
        });
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
        const data = new Payload(evt.data);
        const decoded = await this.fmt.decode(data);
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
              endpoint: this.conn.endpoint?.href,
              database: this.conn.db,
              namespace: this.conn.ns,
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

    try {
      const [result] = await openOrError;

      if (result instanceof Error) {
        throw result;
      }

      if (!result.ok) {
        throw result.error;
      }

      let timeout: any = undefined;
      timeout = setInterval(async () => {
        if (this.ws && this.ws.readyState === OPEN) {
          try {
            const signal = getTimeoutSignal(Math.min(this.pingInterval, 5_000));
            const request: RpcRequest = { method: "ping", params: [] };
            const rpcResp = await this.rpc(request, signal);

            if (rpcResp.error) {
              throw new RpcResponseError(rpcResp, {
                cause: {
                  endpoint: this.conn.endpoint?.href,
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
        }
      }, this.pingInterval);
      this.ee.on(CLOSING, () => {
        clearInterval(timeout);
        timeout = undefined;
      });
    } finally {
      if (!signal.aborted) {
        abort();
      }
    }
  }

  @mutex
  async disconnect(signal: AbortSignal): Promise<
    | Ok<"Disconnected", { warning?: unknown }>
    | Ok<"AlreadyDisconnected">
    | Err<unknown, { warning?: unknown }>
  > {
    const warning: { warning?: unknown } = {};

    if (signal.aborted) {
      return err(signal.reason as unknown, warning);
    }

    if (this.state === CLOSED) {
      return ok("AlreadyDisconnected");
    }

    try {
      await this.setState(CLOSING, () => CLOSING);
    } catch (error) {
      warning.warning = error;
    }

    if (signal.aborted) {
      return err(signal.reason as unknown, warning);
    }

    try {
      const closed = this.ee.once(CLOSED);
      const abortHandler = () => {
        this.ee.emit(
          CLOSED,
          err(signal.reason as unknown, {
            value: CLOSED,
          }),
        );
      };

      if (
        this.ws
        && this.ws.readyState !== CLOSED
        && this.ws.readyState !== CLOSING
      ) {
        signal.addEventListener("abort", abortHandler, { once: true });
        this.ws.close();
      } else {
        this.ee.emit(CLOSED, ok(CLOSED));
      }

      const [result] = await closed;
      signal.removeEventListener("abort", abortHandler);

      return result.ok
        ? ok("Disconnected", warning)
        : err(result.error, warning);
    } catch (error) {
      return err(error, warning);
    }
  }

  async rpc(
    request: RpcRequest,
    signal: AbortSignal,
  ): Promise<BidirectionalRpcResponse> {
    if (this.state === CONNECTING) {
      await this.ee.once(OPEN);
    }

    if (!this.ws || !this.conn.endpoint) {
      throw new ConnectionUnavailable();
    }

    request = this.v8n.parseRpcRequest(request, {
      endpoint: new URL(this.conn.endpoint),
      engineName: "websocket",
    });

    switch (request.method) {
      case "use": {
        const [ns, db] = request.params;

        if (!this.conn.ns && !ns && db) {
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
      throw new SurrealDbTypeError(
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
          endpoint: new URL(this.conn.endpoint),
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
            this.conn.ns = ns;
          }

          if (db) {
            this.conn.db = db;
          }

          break;
        }

        case "signin":
        case "signup":
          this.conn.token = rpc.result;

          break;

        case "authenticate": {
          const [token] = rpc.params;
          this.conn.token = token;

          break;
        }

        case "invalidate":
          delete this.conn.token;

          break;
      }
    }

    return rpcResp;
  }
}
