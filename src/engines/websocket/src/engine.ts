import {
  CLOSED,
  CLOSING,
  type ConnectArgs,
  CONNECTING,
  type DisconnectArgs,
  EngineAbc,
  type EngineAbcConfig,
  OPEN,
  type RpcArgs,
} from "@tai-kun/surrealdb/engine";
import {
  ConnectionUnavailableError,
  DatabaseConflictError,
  MissingNamespaceError,
  NamespaceConflictError,
  ResponseError,
  RpcResponseError,
  SurrealTypeError,
  unreachable,
  WebSocketEngineError,
} from "@tai-kun/surrealdb/errors";
import type {
  BidirectionalRpcResponse,
  RpcParams,
  RpcResult,
} from "@tai-kun/surrealdb/types";
import {
  getTimeoutSignal,
  makeAbortApi,
  mutex,
  Serial,
  throwIfAborted,
} from "@tai-kun/surrealdb/utils";
import { isLiveResult, isRpcResponse } from "@tai-kun/surrealdb/validator";
import type { Promisable, ValueOf } from "type-fest";
import type { WebSocket as WsWebSocket } from "ws";

type GlobalWebSocket = typeof globalThis extends
  { WebSocket: new(...args: any) => infer R } ? R
  : never;

export type CreateWebSocket = (
  address: URL,
  protocol: string | undefined,
) => Promisable<GlobalWebSocket | WsWebSocket>;

export interface EngineConfig extends EngineAbcConfig {
  readonly createWebSocket: CreateWebSocket;
  readonly pingInterval?: number | undefined;
  readonly onCaughtError?: (error: unknown) => void;
}

export default class WebSocketEngine extends EngineAbc {
  readonly name = "websocket";

  protected ws: WsWebSocket | null = null;
  protected readonly id = new Serial();
  protected readonly newWs: CreateWebSocket;
  protected readonly pingInterval: number;
  protected readonly onCaughtError: (error: unknown) => void;

  constructor(config: EngineConfig) {
    super(config);
    this.newWs = config.createWebSocket;
    this.pingInterval = Math.max(1_000, config.pingInterval ?? 30_000);
    this.onCaughtError = config.onCaughtError || console.error;
  }

  @mutex
  async connect(
    {
      endpoint,
      signal: timeoutSignal,
    }: ConnectArgs,
  ): Promise<void> {
    if (this.state === OPEN) {
      return;
    }

    if (this.state !== CLOSED) {
      unreachable(this.state as never);
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
          // イベントに message プロパティが含まれているかどうかは分かりません。
          //
          // - Mozilla: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event#event_type
          // - Node.js:
          //     - undici: https://github.com/nodejs/undici/blob/v6.18.1/types/websocket.d.ts#L127-L133
          //     - ws: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ws/index.d.ts#L289-L294
          // - Deno: https://github.com/denoland/deno/blob/v1.43.6/ext/web/02_event.js#L1064-L1133
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
        // 早期の切断に由来するエラーコードをエラーとして扱いません。
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
      } catch (e) {
        this.onCaughtError(e);
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
      } catch (e) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            // open イベントハンドラー内で発生したエラーを、
            // カスタムエラーコード 3001 として報告します。
            3001,
            "An error occurred within the handler for the \"open\" event.",
            {
              cause: e,
              fatal: true,
            },
          ),
        );
      }
    });
    ws.addEventListener("message", async evt => {
      try {
        const rpcResp = this.fmt.decodeSync(evt.data);

        if (!isRpcResponse(rpcResp)) {
          throw new ResponseError("Missing rpc response.", {
            cause: {
              endpoint: endpoint.href,
              // TODO(tai-kun): 情報を追加
              // ...cause,
            },
          });
        }

        if ("id" in rpcResp) {
          this.ee.emit(`rpc_${rpcResp.id}`, rpcResp);
        } else if ("result" in rpcResp) {
          if (!isLiveResult(rpcResp.result)) {
            throw new ResponseError("Missing live result", {
              cause: {
                endpoint: endpoint.href,
                // TODO(tai-kun): 情報を追加
                // ...cause,
              },
            });
          }

          const { id, action, result: input } = rpcResp.result;
          const result = this.v8n.parseLiveResult({
            input,
            action,
            engine: this.name,
            endpoint: new URL(endpoint),
          });

          this.ee.emit(`live_${String(id)}`, { action, result });
        } else {
          throw new RpcResponseError(rpcResp, {
            cause: {
              endpoint: endpoint.href,
            },
          });
        }
      } catch (e) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            // message イベントハンドラー内で発生したエラーを、
            // カスタムエラーコード 3002 として報告します。
            3002,
            "An error occurred within the handler for the \"message\" event.",
            {
              cause: e,
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
        const rpcResp = await this.rpc({
          signal: getTimeoutSignal(pingTimeoutMs),
          request: {
            method: "ping",
          },
        });

        if (rpcResp.error) {
          throw new RpcResponseError(rpcResp, {
            cause: {
              endpoint: endpoint.href,
            },
          });
        }
      } catch (e) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            // ping メッセージの送信に失敗したエラーを、
            // カスタムエラーコード 3003 として報告します。
            3003,
            "Failed to send a ping message.",
            {
              cause: e,
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
  async disconnect({ signal }: DisconnectArgs): Promise<void> {
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

  async rpc({ request, signal }: RpcArgs): Promise<BidirectionalRpcResponse> {
    if (this.state === CONNECTING) {
      await this.ee.once(OPEN, { signal });
    }

    // 接続情報のスナップショットを取得します。
    // 以降、接続情報を参照する際はこれを使用します。
    const conn = this.getConnectionInfo();

    if (!this.ws || conn.state !== OPEN) {
      throw new ConnectionUnavailableError();
    }

    request = this.v8n.parseRpcRequest({
      input: request,
      engine: this.name,
      endpoint: new URL(conn.endpoint),
    });

    switch (request.method) {
      case "use": {
        let { ns, db } = conn;
        const [namespace, database] = request.params;

        if (namespace !== undefined) {
          ns = namespace;
        }

        if (database !== undefined) {
          db = database;
        }

        if (ns === null && db !== null) {
          throw new MissingNamespaceError(db);
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
      `${request.method}_${this.id.next()}`;
    const body: unknown = this.fmt.encodeSync({
      id,
      method: request.method,
      params: request.params || [],
    });

    if (typeof body !== "string" && !(body instanceof Uint8Array)) {
      throw new SurrealTypeError("string | Uint8Array", typeof body);
    }

    const resp = this.ee.once(`rpc_${id}`, { signal });
    this.ws.send(body);
    const [rawResp] = await resp;
    // `rawResp` は message イベントハンドラー内で検証済みなので、ここではキャストするだけ。
    const rpcResp = rawResp as BidirectionalRpcResponse;

    if ("result" in rpcResp) {
      const rpc = {
        method: request.method,
        params: request.params,
        result: rpcResp.result = this.v8n.parseRpcResult({
          input: rpcResp.result,
          engine: this.name,
          request,
          endpoint: new URL(conn.endpoint),
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

          // `.rpc` メソッドの実行開始直後の名前空間から変更がなければ更新する。
          if (ns !== undefined) {
            if (this.namespace !== conn.ns && this.namespace !== ns) {
              throw new NamespaceConflictError(this.namespace, conn.ns);
            }

            this.namespace = ns;
          }

          // `.rpc` メソッドの実行開始直後のデータベースから変更がなければ更新する。
          if (db !== undefined) {
            if (this.database !== conn.db && this.database !== db) {
              throw new DatabaseConflictError(this.database, conn.db);
            }

            this.database = db;
          }

          break;
        }

        case "signin":
        case "signup":
          this.token = rpc.result;
          break;

        case "authenticate":
          [this.token] = rpc.params;
          break;

        case "invalidate":
          this.token = null;
          break;
      }
    }

    return rpcResp;
  }
}