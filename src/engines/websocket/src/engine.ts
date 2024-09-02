import {
  type ConnectArgs,
  type DisconnectArgs,
  EngineAbc,
  type EngineAbcConfig,
  type EngineEventMap,
  processQueryRequest,
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
  RpcQueryRequest,
  RpcResult,
} from "@tai-kun/surrealdb/types";
import {
  channel,
  getTimeoutSignal,
  isLiveResult,
  isRpcResponse,
  Serial,
  StatefulPromise,
  type TaskEmitter,
  throwIfAborted,
} from "@tai-kun/surrealdb/utils";
import type { Promisable } from "type-fest";
import type { WebSocket as WsWebSocket } from "ws";

type InferWebSocket<T> = T extends
  { readonly WebSocket: new(...args: any) => infer W } ? W : never;

type NativeWebSocket = InferWebSocket<
  | typeof global
  | typeof window
  | typeof self
>;

type WebSocket = WsWebSocket | NativeWebSocket; // isows の型定義はこれより狭い。

export type CreateWebSocket = (
  address: URL,
  protocol: string | undefined,
) => Promisable<WebSocket>;

export interface WebSocketEngineConfig extends EngineAbcConfig {
  readonly createWebSocket: CreateWebSocket;
  readonly pingInterval?: number | (() => number) | undefined;
}

export default class WebSocketEngine extends EngineAbc {
  readonly name = "websocket";

  protected ws: WebSocket | null = null;
  protected readonly id = new Serial();
  protected readonly newWs: CreateWebSocket;
  protected readonly pingInterval: () => number;

  constructor(config: WebSocketEngineConfig) {
    super(config);
    const {
      pingInterval,
      createWebSocket,
    } = config;
    this.newWs = createWebSocket;
    this.pingInterval = typeof pingInterval === "function"
      ? pingInterval
      : (ms => () => ms)(Math.max(3_000, pingInterval ?? 30_000));
  }

  async connect({ endpoint, signal }: ConnectArgs): Promise<void> {
    throwIfAborted(signal);
    const conn = this.getConnectionInfo();

    if (conn.state === "open") {
      return;
    }

    if (conn.state !== "closed") {
      unreachable(conn as never);
    }

    await this.transition(
      {
        state: "connecting",
        endpoint,
      },
      () => "closed",
    );
    const ws = await this.newWs(new URL(endpoint), this.fmt.wsFormat);
    ws.addEventListener("error", evt => {
      if (__DEV__) {
        channel.publish("websocket:ws:error", evt);
      }

      this.ee.emit(
        "error",
        new WebSocketEngineError(
          3150,
          // イベントに message プロパティが含まれているかどうかは分かりません。
          //
          // - Mozilla: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event#event_type
          // - Node.js:
          //     - undici: https://github.com/nodejs/undici/blob/v6.18.1/types/websocket.d.ts#L127-L133
          //     - ws: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ws/index.d.ts#L289-L294
          // - Deno: https://github.com/denoland/deno/blob/v1.43.6/ext/web/02_event.js#L1064-L1133
          "message" in evt
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
      if (__DEV__) {
        channel.publish("websocket:ws:close", evt);
      }

      this.ws = null;
      this.id.reset();

      switch (evt.code) {
        // 正常系
        case 1000: // Normal Closure
        // 予約済み
        case 1004: // Reserved
        case 1005: // No Status
        case 1015: // TLS Handshake
        // 早期の切断に由来するエラーコードをエラーとして扱いません。
        case 1001: // Going Away
        case 1006: // Abnormal Closure (かつ、予約済み)
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
          this.ee.emit(
            "error",
            new WebSocketEngineError(evt.code, evt.reason),
          );
      }

      try {
        await this.transition("closed", () => "closed");
      } catch (e) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            3154,
            "An error occurred within the handler for the \"close\" event.",
            {
              cause: e,
              fatal: false,
            },
          ),
        );
      }
    });
    ws.addEventListener("open", async evt => {
      if (__DEV__) {
        channel.publish("websocket:ws:open", evt);
      }

      try {
        this.ws = ws;
        await this.transition(
          {
            state: "open",
            endpoint,
          },
          () => {
            this.ws = null;

            return "closed";
          },
        );
      } catch (e) {
        this.ee.emit(
          "error",
          new WebSocketEngineError(
            // open イベントハンドラー内で発生したエラーを、
            // カスタムエラーコード 3151 として報告します。
            3151,
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
      if (__DEV__) {
        channel.publish("websocket:ws:message", evt);
      }

      try {
        // TODO(tai-kun): Blob の .stream を活用できるように。CBOR の非同期デコードを実装
        // したけど、ボディサイズによっては同期デコードの方が高速だと思うので、そのへんどうするか検討

        // Node.js v22 と ws v8.18.0 以降は Blob も来る。
        const data = evt.data instanceof Blob
          ? await (evt.data as Blob).arrayBuffer()
          : evt.data;
        const rpcResp = this.fmt.decodeSync(data);

        if (!isRpcResponse(rpcResp)) {
          throw new ResponseError("Missing rpc response.", {
            // cause: (evt.data as Buffer).map(v => v).join(),
            cause: {
              endpoint: endpoint.href,
              response: rpcResp,
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
                liveResult: rpcResp.result,
                // TODO(tai-kun): 情報を追加
                // ...cause,
              },
            });
          }

          const { id, action, result } = rpcResp.result;

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
            // カスタムエラーコード 3152 として報告します。
            3152,
            "An error occurred within the handler for the \"message\" event.",
            {
              cause: e,
              fatal: false,
            },
          ),
        );
      }
    });

    const openPromise = this.ee.once("open", { signal });
    const errorPromise = this.ee.once("error", { signal });

    try {
      const [result] = await Promise.race([
        openPromise,
        errorPromise,
      ]);

      if (result instanceof Error) {
        throw result;
      }

      if ("error" in result) {
        throw result.error;
      }
    } finally {
      await Promise.all([
        openPromise.cancel(),
        errorPromise.cancel(),
      ]);
    }

    const createPromise = () => {
      let i: any,
        int: number,
        res: (v: boolean) => void,
        pro = new StatefulPromise<boolean>(r => {
          i = setTimeout(res = r, int = this.pingInterval(), false);
        });

      return Object.assign(pro, {
        interval: int!, // 現在未使用
        cancel() {
          if (pro.state === "pending") {
            clearTimeout(i);
            res(true);
          }
        },
      });
    };
    let promise = createPromise();
    const pinger = (async () => {
      while (true) {
        const canceled = await promise;

        if (canceled) {
          break;
        }

        try {
          if (__DEV__) {
            channel.publish("websocket:ping", { type: "ping" });
          }

          const timeout = 5_000;
          const rpcResp = await this.rpc({
            signal: getTimeoutSignal(timeout),
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

          if (__DEV__) {
            channel.publish("websocket:pong", { type: "pong" });
          }
        } catch (e) {
          this.ee.emit(
            "error",
            new WebSocketEngineError(
              // ping メッセージの送信に失敗したエラーを、
              // カスタムエラーコード 3153 として報告します。
              3153,
              "Failed to send a ping message.",
              {
                cause: e,
                fatal: false,
              },
            ),
          );
        } finally {
          promise = createPromise();
        }
      }
    })();

    this.ee.on(
      "closing",
      async function stop(this: TaskEmitter<EngineEventMap>) {
        this.off("closing", stop);
        promise.cancel();
        await pinger;
      },
    );
  }

  async disconnect({ signal }: DisconnectArgs): Promise<void> {
    throwIfAborted(signal);
    const conn = this.getConnectionInfo();

    if (conn.state === "closed") {
      return;
    }

    if (conn.state !== "open") {
      unreachable(conn as never);
    }

    await this.transition(
      {
        state: "closing",
        endpoint: conn.endpoint,
      },
      () => ({
        state: "closing",
        endpoint: conn.endpoint,
      }),
    );
    const promiseClosed = this.ee.once("closed", { signal });

    if (
      this.ws
      && this.ws.readyState !== 3 // WebSocket.CLOSED
      && this.ws.readyState !== 2 // WebSocket.CLOSING
    ) {
      this.ws.close();
    } else {
      this.ee.emit("closed", {
        state: "closed",
      });
    }

    const [result] = await promiseClosed;

    if ("error" in result) {
      throw result.error;
    }
  }

  async rpc({ request, signal }: RpcArgs): Promise<BidirectionalRpcResponse> {
    // 接続情報のスナップショットを取得します。
    // 以降、接続情報を参照する際はこれを使用します。
    const conn = this.getConnectionInfo();

    if (!this.ws || conn.state !== "open") {
      throw new ConnectionUnavailableError();
    }

    switch (request.method) {
      case "use": {
        let { namespace, database } = conn;
        const [ns, db] = request.params;

        if (ns !== undefined) {
          namespace = ns;
        }

        if (db !== undefined) {
          database = db;
        }

        if (namespace === null && database !== null) {
          throw new MissingNamespaceError(database);
        }

        // (1) JSON では null と undefined を区別しないけど、SurealDB は区別する。
        //     null は選択中の名前空間またはデータベースを未選択にするので、undefined を使える
        //     CBOR フォーマッターと同じような使い方を JSON フォーマッターですると事故る可能性が高い。
        //
        // (2) あと名前空間とデータベースが両方選択されている状態で CBOR で
        //     [ "名前空間", undefined ] をリクエストするとデータベースが未選択になる。
        //     (これは SurrealDB のバグ？)
        //
        // という動機があって、undefined を文字列に置き換えるように努力する。
        {
          if (ns === undefined && conn.namespace !== null) {
            request = {
              method: request.method,
              params: [conn.namespace, request.params[1]],
            };
          }

          if (db === undefined && conn.database !== null) {
            request = {
              method: request.method,
              params: [request.params[0], conn.database],
            };
          }
        }

        break;
      }

      case "query": {
        request = processQueryRequest(request) as RpcQueryRequest;
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
      throw new SurrealTypeError(["String", "Uint8Array"], body);
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
        result: rpcResp.result,
      } as {
        [M in (typeof request)["method"]]: {
          method: M;
          params: RpcParams<M>;
          result: RpcResult<M>;
        };
      }[(typeof request)["method"]];

      switch (rpc.method) {
        case "use": {
          const [ns, db] = rpc.params;

          // `.rpc` メソッドの実行開始直後の名前空間から変更がなければ更新する。
          if (ns !== undefined) {
            if (this.namespace !== conn.namespace && this.namespace !== ns) {
              throw new NamespaceConflictError(this.namespace, conn.namespace);
            }

            this.namespace = ns;
          }

          // `.rpc` メソッドの実行開始直後のデータベースから変更がなければ更新する。
          if (db !== undefined) {
            if (this.database !== conn.database && this.database !== db) {
              throw new DatabaseConflictError(this.database, conn.database);
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
