import {
  CLOSED,
  CLOSING,
  type ConnectArgs,
  CONNECTING,
  EngineAbc,
  type EngineAbcConfig,
  OPEN,
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
  RpcResult,
} from "@tai-kun/surrealdb/types";
import { isBrowser, mutex } from "@tai-kun/surrealdb/utils";
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

  // TODO(tai-kun): signal
  @mutex
  async connect({ endpoint }: ConnectArgs): Promise<void> {
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
    await this.transition(
      {
        state: OPEN,
        endpoint,
      },
      () => CLOSED,
    );
  }

  // TODO(tai-kun): signal
  @mutex
  async disconnect(): Promise<void> {
    const conn = this.getConnectionInfo();
    const close = async () => {
      await this.transition(CLOSED, () => CLOSED);
    };

    switch (conn.state) {
      case OPEN:
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

    request = this.v8n.parseRpcRequest({
      input: request,
      engine: this.name,
      endpoint: new URL(conn.endpoint),
    });

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
          result: null,
        };
      }

      case "let": {
        const [name, value] = request.params;
        this.vars[name] = cloneSync(this.fmt, value);

        return {
          result: null,
        };
      }

      case "unset": {
        const [name] = request.params;
        delete this.vars[name];

        return {
          result: null,
        };
      }

      case "query": {
        const [arg0, inlineVars] = request.params;
        const { text, vars: defaultVars } = typeof arg0 === "string"
          ? { text: arg0, vars: {} }
          : arg0;
        request = {
          method: request.method,
          params: [text, { ...this.vars, ...defaultVars, ...inlineVars }],
        };
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

    if (this.fmt.decode) {
      rpcResp = await this.fmt.decode({
        reader: resp.body.getReader(),
        signal,
      });
    } else {
      rpcResp = this.fmt.decodeSync(await resp.arrayBuffer());
      // throwIfAborted(signal);
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
        result: rpcResp.result = this.v8n.parseRpcResult({
          input: rpcResp.result,
          engine: this.name,
          request,
          endpoint: new URL(conn.endpoint),
        }),
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
