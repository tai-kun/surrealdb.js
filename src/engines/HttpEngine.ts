import type { ValueOf } from "type-fest";
import {
  ConnectionUnavailable,
  MissingNamespace,
  ResponseError,
  ValidationError,
} from "../common/errors";
import { RpcResponseData } from "../common/RpcResponseData";
import type {
  IdLessRpcResponse,
  RpcParams,
  RpcRequest,
  RpcResult,
} from "../common/types";
import type { RpcData } from "../formatters/Formatter";
import { type Err, err, mutex, type Ok, ok } from "../internal";
import {
  CLOSED,
  CLOSING,
  CONNECTING,
  Engine,
  type EngineConfig,
  OPEN,
} from "./Engine";

/**
 * The request init for the fetch function in the HTTP engine.
 */
export type HttpEngineFetchRequestInit = {
  method: "POST";
  headers: {
    "Content-Type": string;
    "Surreal-DB"?: string;
    "Surreal-NS"?: string;
    Accept: string;
    Authorization?: `Bearer ${string}`;
  };
  body: RpcData;
  signal: AbortSignal;
};

/**
 * The response for the fetch function in the HTTP engine.
 */
export type HttpEngineFetchResponse = {
  /**
   * The status code. Anything other than `200` is considered a failure.
   */
  readonly status: number;
  /**
   * Returns the response data as a ArrayBuffer.
   */
  readonly arrayBuffer: () => Promise<ArrayBuffer>;
};

/**
 * The fetch function for the HTTP engine.
 *
 * @param url - The URL to fetch.
 * @param init - The request init.
 * @returns The fetch response.
 */
export type HttpEngineFetcher = (
  url: string,
  init: HttpEngineFetchRequestInit,
) => Promise<HttpEngineFetchResponse>;

/**
 * The HTTP engine configuration.
 */
export interface HttpEngineConfig extends EngineConfig {
  /**
   * The fetch function for the HTTP engine.
   */
  readonly fetch?: HttpEngineFetcher | undefined;
}

/**
 * The HTTP engine for `Surreal`.
 */
export class HttpEngine extends Engine {
  /**
   * Variables on the current connection.
   *
   * Although HTTP-based RPC fails on requests to "let" and "unset" methods,
   * this is used to provide equivalent functionality to WebSocket-based RPC.
   */
  protected vars: Record<string, unknown> = {};
  /**
   * The fetch function for the HTTP engine.
   */
  protected fetch: HttpEngineFetcher;

  /**
   * Creates a new `HttpEngine` instance.
   *
   * @param config - The configuration for the HTTP engine.
   */
  constructor(config: HttpEngineConfig) {
    if (!config.formatter.mimeType) {
      throw new ValidationError("Formatter must have a MIME type");
    }

    super(config);
    this.fetch = config.fetch || (
      // @ts-expect-error
      typeof document === "undefined" // Document Guard
        ? fetch
        // @ts-expect-error
        : window.fetch.bind(window)
    );
  }

  @mutex
  async connect(url: URL): Promise<void> {
    if (this.state === OPEN) {
      return;
    }

    this.conn.url = new URL(url); // copy
    await this.setState(CONNECTING, () => {
      this.conn = {};

      return CLOSED;
    });

    await this.setState(OPEN, () => {
      this.conn = {};

      return CLOSED;
    });
  }

  @mutex
  async disconnect(): Promise<
    | Ok<"Disconnected">
    | Ok<"AlreadyDisconnected">
    | Err<unknown>
  > {
    if (this.state === CLOSED) {
      return ok("AlreadyDisconnected");
    }

    try {
      await this.setState(CLOSING, () => CLOSING);

      return ok("Disconnected");
    } catch (error) {
      return err(error);
    } finally {
      this.conn = {};
      this.vars = {};

      try {
        await this.setState(CLOSED, () => CLOSED);
      } catch {
        // Ignore
        // Errors that occur within the `CLOSED` event are handled
        // by `SurrealCore`, which uses this engine.
      }
    }
  }

  async rpc(
    request: RpcRequest,
    signal: AbortSignal,
  ): Promise<IdLessRpcResponse> {
    if (this.state === CONNECTING) {
      await this.ee.once(OPEN);
    }

    if (!this.conn.url) {
      throw new ConnectionUnavailable();
    }

    request = this.v8n.parseRpcRequest(request).unwrap();

    switch (request.method) {
      case "use": {
        const [ns, db] = request.params;

        if (ns) {
          this.conn.ns = ns;
        }

        if (db) {
          if (!this.conn.ns) {
            throw new MissingNamespace();
          }

          this.conn.db = db;
        }

        return {
          result: null,
        };
      }

      case "let": {
        const [name, value] = request.params;
        this.vars[name] = await this.fmt.copy(value);

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
        const [arg0, vars] = request.params;
        const { text, vars: varsBase } = typeof arg0 === "string"
          ? { text: arg0, vars: {} }
          : arg0;
        request = {
          method: request.method,
          params: [text, { ...this.vars, ...varsBase, ...vars }],
        };

        break;
      }
    }

    if (!this.conn.ns && this.conn.db) {
      throw new MissingNamespace();
    }

    const rawRpcData: unknown = await this.fmt.encode(request);
    const rpcData = this.v8n.parseRpcData(rawRpcData).unwrap();
    const rawResp: unknown = await this.fetch(this.conn.url.toString(), {
      body: rpcData,
      signal,
      method: "POST",
      headers: {
        Accept: this.fmt.mimeType!,
        "Content-Type": this.fmt.mimeType!,
        ...(this.conn.ns ? { "Surreal-NS": this.conn.ns } : {}),
        ...(this.conn.db ? { "Surreal-DB": this.conn.db } : {}),
        ...(this.conn.token
          ? { Authorization: `Bearer ${this.conn.token}` }
          : {}),
      },
    });
    const resp = this.v8n.parseFetchResponse(rawResp).unwrap();
    const buff = await resp.arrayBuffer();
    const data = new RpcResponseData(buff);

    if (resp.status !== 200) {
      const message = await data.text();
      throw new ResponseError(message, { cause: buff });
    }

    const decoded = await this.fmt.decode(data);
    const rpcResp = this.v8n.parseIdLessRpcResponse(decoded).unwrap();

    if ("result" in rpcResp) {
      const rpc = {
        method: request.method,
        params: request.params,
        result: this.v8n.parseRpcResult(rpcResp.result, request).unwrap(),
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

    // this.ee.emit(`rpc/${rpc.method}/${id}`, rpcResp);

    return rpcResp;
  }
}
