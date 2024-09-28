import {
  type CloseArgs,
  type ConnectArgs,
  EngineAbc,
  type EngineAbcConfig,
  processQueryRequest,
  type RpcArgs,
} from "@tai-kun/surrealdb/engine";
import {
  ConnectionUnavailableError,
  MissingNamespaceError,
  ResponseError,
  SurrealTypeError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import { cloneSync } from "@tai-kun/surrealdb/formatter";
import type {
  BidirectionalRpcResponse,
  IdLessRpcResponse,
  RpcParams,
  RpcQueryRequest,
  RpcResult,
} from "@tai-kun/surrealdb/types";
import {
  isBrowser,
  isRpcResponse,
  throwIfAborted,
} from "@tai-kun/surrealdb/utils";

export interface HttpFetcherRequestInit {
  method: "POST";
  headers: {
    "Content-Type": string;
    "Surreal-DB"?: string;
    "Surreal-NS"?: string;
    Accept: string;
    Authorization?: `Bearer ${string}`;
  };
  body: string | Uint8Array;
  signal: AbortSignal;
}

export type HttpFetcher = (
  input: string,
  init: HttpFetcherRequestInit,
) => PromiseLike<Response>;

export interface HttpEngineConfig extends EngineAbcConfig {
  readonly fetch?: HttpFetcher | undefined;
}

export default class HttpEngine extends EngineAbc {
  readonly name = "http";

  protected vars: Record<string, unknown> = {};

  protected fetch: HttpFetcher;

  constructor(config: HttpEngineConfig) {
    super(config);
    this.fetch = config.fetch
      || (isBrowser() ? window.fetch.bind(window) : fetch);
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
    await this.transition(
      {
        state: "open",
        endpoint,
      },
      () => "closed",
    );
  }

  async close({ signal }: CloseArgs): Promise<void> {
    throwIfAborted(signal);
    const conn = this.getConnectionInfo();

    if (conn.state === "closed") {
      return;
    }

    if (conn.state !== "open") {
      unreachable(conn as never);
    }

    this.vars = {};
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
    await this.transition("closed", () => "closed");
  }

  async rpc({ request, signal }: RpcArgs): Promise<IdLessRpcResponse> {
    // 接続情報のスナップショットを取得します。
    // 以降、接続情報を参照する際はこれを使用します。
    const conn = this.getConnectionInfo();

    if (conn.state !== "open") {
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

        this.namespace = namespace;
        this.database = database;

        return {
          result: undefined,
        };
      }

      case "let": {
        const [name, value] = request.params;
        this.vars[name] = this.fmt.toEncoded?.(value)
          // WebSocket エンジンとの挙動を合わせるためにパラメーターを不変にする。
          ?? cloneSync(this.fmt, value);

        return {
          result: undefined,
        };
      }

      case "unset": {
        const [name] = request.params;
        delete this.vars[name];

        return {
          result: undefined,
        };
      }

      case "query": {
        const req = processQueryRequest(request);
        req.params[1] = Object.assign({}, this.vars, req.params[1]);
        request = req as RpcQueryRequest;
        break;
      }
    }

    if (conn.namespace === null && conn.database !== null) {
      throw new MissingNamespaceError(conn.database);
    }

    const body: unknown = this.fmt.encodeSync(request);

    if (typeof body !== "string" && !(body instanceof Uint8Array)) {
      throw new SurrealTypeError(["String", "Uint8Array"], body);
    }

    const headers: HttpFetcherRequestInit["headers"] = {
      Accept: this.fmt.contentType,
      "Content-Type": this.fmt.contentType,
    };

    if (conn.namespace != null) {
      headers["Surreal-NS"] = conn.namespace;
    }

    if (conn.database != null) {
      headers["Surreal-DB"] = conn.database;
    }

    if (conn.token) {
      headers["Authorization"] = `Bearer ${conn.token}`;
    }

    const resp: unknown = await this.fetch(conn.endpoint.href, {
      body,
      signal,
      method: "POST",
      headers,
    });
    const cause = {
      method: request.method,
      // TODO(tai-kun): params には機微情報が含まれている可能性があるので、method のみにしておく？
      params: request.params,
      endpoint: conn.endpoint.href,
      database: conn.database,
      namespace: conn.namespace,
    };

    if (!(resp instanceof Response) || resp.body === null) {
      throw new ResponseError("Expected `Response` contains a non-null body.", {
        cause: Object.assign(cause, {
          response: resp,
        }),
      });
    }

    if (resp.status !== 200) {
      const message = await resp.text();
      throw new ResponseError(message, {
        cause: Object.assign(cause, {
          status: resp.status,
        }),
      });
    }

    // throwIfAborted(signal);
    let rpcResp: unknown;

    if (this.fmt.decodeStream && this.fmt.decodingStrategy) {
      const length = Number(resp.headers.get("content-length"));

      if (
        length === length
        && length > 0
        && this.fmt.decodingStrategy({ name: "fetch", length }) === "stream"
      ) {
        rpcResp = await this.fmt.decodeStream(resp.body, signal);
      } else {
        rpcResp = this.fmt.decodeSync(await resp.arrayBuffer());
      }
    } else {
      rpcResp = this.fmt.decodeSync(await resp.arrayBuffer());
    }

    if (!isRpcResponse(rpcResp) || "id" in rpcResp) {
      throw new ResponseError("Expected id-less rpc response.", {
        cause: Object.assign(cause, {
          response: rpcResp,
        }),
      });
    }

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

    // 双方向通信のレスポンスに擬態する。
    const id: BidirectionalRpcResponse["id"] = `${request.method}_0`;
    const hooks = this.ee.emit(`rpc_${id}`, {
      id,
      ...rpcResp,
    });

    if (hooks) {
      await Promise.all(hooks);
    }

    return rpcResp;
  }
}
