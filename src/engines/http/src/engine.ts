import {
  CLOSED,
  CLOSING,
  type ConnectArgs,
  CONNECTING,
  type DisconnectArgs,
  EngineAbc,
  type EngineAbcConfig,
  OPEN,
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
  IdLessRpcResponse,
  RpcParams,
  RpcQueryRequest,
  RpcResult,
} from "@tai-kun/surrealdb/types";
import { isBrowser, mutex, throwIfAborted } from "@tai-kun/surrealdb/utils";
import { isRpcResponse } from "@tai-kun/surrealdb/validator";

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

  @mutex
  async connect({ endpoint, signal }: ConnectArgs): Promise<void> {
    throwIfAborted(signal);
    const conn = this.getConnectionInfo();

    if (conn.state === OPEN) {
      return;
    }

    if (conn.state !== CLOSED) {
      unreachable(conn as never);
    }

    await this.transition(
      {
        state: CONNECTING,
        endpoint,
      },
      () => CLOSED,
    );
    await this.transition(
      {
        state: OPEN,
        endpoint,
      },
      () => CLOSED,
    );
  }

  @mutex
  async disconnect({ signal }: DisconnectArgs): Promise<void> {
    throwIfAborted(signal);
    const conn = this.getConnectionInfo();

    if (conn.state === CLOSED) {
      return;
    }

    if (conn.state !== OPEN) {
      unreachable(conn as never);
    }

    this.vars = {};
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
    await this.transition(CLOSED, () => CLOSED);
  }

  async rpc({ request, signal }: RpcArgs): Promise<IdLessRpcResponse> {
    if (this.state === CONNECTING) {
      await this.ee.once(OPEN, { signal });
    }

    // 接続情報のスナップショットを取得します。
    // 以降、接続情報を参照する際はこれを使用します。
    const conn = this.getConnectionInfo();

    if (conn.state !== OPEN) {
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
        req.params[1] = { ...this.vars, ...req.params[1] };
        request = req as RpcQueryRequest;
        break;
      }
    }

    if (conn.namespace === null && conn.database !== null) {
      throw new MissingNamespaceError(conn.database);
    }

    if (!this.fmt.mimeType) {
      throw new SurrealTypeError("non-empty string", String(this.fmt.mimeType));
    }

    const body: unknown = this.fmt.encodeSync(request);

    if (typeof body !== "string" && !(body instanceof Uint8Array)) {
      throw new SurrealTypeError("string | Uint8Array", String(body));
    }

    const resp: unknown = await this.fetch(conn.endpoint.href, {
      body,
      signal,
      method: "POST",
      headers: {
        Accept: this.fmt.mimeType,
        "Content-Type": this.fmt.mimeType,
        ...(conn.namespace != null ? { "Surreal-NS": conn.namespace } : {}),
        ...(conn.database != null ? { "Surreal-DB": conn.database } : {}),
        ...(conn.token ? { Authorization: `Bearer ${conn.token}` } : {}),
      },
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
        cause: {
          response: resp,
          ...cause,
        },
      });
    }

    if (resp.status !== 200) {
      const message = await resp.text();
      throw new ResponseError(message, {
        cause: {
          status: resp.status,
          ...cause,
        },
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
        cause: {
          response: rpcResp,
          ...cause,
        },
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

    // this.ee.emit(`rpc/${rpc.method}/${id}`, rpcResp);

    return rpcResp;
  }
}
