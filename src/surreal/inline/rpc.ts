import type { Jwt } from "@tai-kun/surrealdb/clients/standard";
import {
  processEndpoint,
  type ProcessEndpointOptions,
  processQueryRequest,
} from "@tai-kun/surrealdb/engine";
import type { HttpFetcherRequestInit } from "@tai-kun/surrealdb/engines/http";
import {
  MissingNamespaceError,
  ResponseError,
  RpcResponseError,
  SurrealTypeError,
} from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import type { RpcParams, RpcResultMapping } from "@tai-kun/surrealdb/types";
import {
  getTimeoutSignal,
  isRpcResponse,
  throwIfAborted,
} from "@tai-kun/surrealdb/utils";
import type { UnionToIntersection, ValueOf } from "type-fest";

export type InlineRpcFetcherRequestInit = {
  method: "POST";
  headers: {
    "Content-Type": string;
    "Surreal-DB"?: string;
    "Surreal-NS"?: string;
    Accept: string;
    Authorization?: string;
  };
  body: string | Uint8Array;
  signal: AbortSignal;
};

export type InlineRpcFetcher = (
  input: string,
  init: InlineRpcFetcherRequestInit,
) => Response | PromiseLike<Response>;

export type InlineRpcOptions = ProcessEndpointOptions & {
  readonly formatter?: Formatter | undefined;
  readonly namespace?: string | undefined;
  readonly database?: string | undefined;
  readonly token?: string | Jwt | undefined;

  readonly fetch?: InlineRpcFetcher | undefined;
  readonly signal?: AbortSignal | undefined;
};

export type InlineRpcMethod =
  | "authenticate"
  | "create"
  | "delete"
  | "info"
  | "insert"
  | "invalidate"
  | "merge"
  | "patch"
  | "ping"
  | "query"
  | "relate"
  | "run"
  | "select"
  | "signin"
  | "signup"
  | "unset"
  | "update"
  | "upsert"
  | "version";

async function rpc(
  endpoint: string | URL,
  method: InlineRpcMethod,
  options:
    | (InlineRpcOptions & { readonly params?: any })
    | undefined = {},
): Promise<unknown> {
  const {
    fetch = globalThis.fetch satisfies InlineRpcFetcher,
    token,
    signal = getTimeoutSignal(5_000),
    database: db,
    formatter: fmt = new JsonFormatter() as never,
    namespace: ns,
    transformEndpoint,
  } = options;
  let {
    params = [],
  } = options;

  throwIfAborted(signal);

  if (ns == null && db != null) {
    throw new MissingNamespaceError(db);
  }

  if (method === "query") {
    params = processQueryRequest({ method, params }).params as [
      text: string,
      vars: { [p: string]: unknown },
    ];
  }

  const body: unknown = fmt.encodeSync({ method, params });

  if (typeof body !== "string" && !(body instanceof Uint8Array)) {
    throw new SurrealTypeError(["String", "Uint8Array"], body);
  }

  const headers: HttpFetcherRequestInit["headers"] = {
    Accept: fmt.contentType,
    "Content-Type": fmt.contentType,
  };

  if (ns != null) {
    headers["Surreal-NS"] = ns;
  }

  if (db != null) {
    headers["Surreal-DB"] = db;
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  endpoint = processEndpoint(endpoint, { transformEndpoint }).href;
  const resp = await fetch(endpoint, {
    body,
    method: "POST",
    signal,
    headers,
  });
  const cause = {
    request: {
      method,
      // TODO(tai-kun): params には機微情報が含まれている可能性があるので、method のみにしておく？
      params,
    },
    endpoint,
    database: db,
    namespace: ns,
  };

  if (!(resp instanceof Response) || resp.body === null) {
    throw new ResponseError("Expected `Response` contains a non-null body.", {
      cause: Object.assign({ response: resp }, cause),
    });
  }

  if (resp.status !== 200) {
    const message = await resp.text();
    throw new ResponseError(message, {
      cause: Object.assign({ response: resp }, cause),
    });
  }

  // throwIfAborted(signal);
  let rpcResp: unknown;

  if (fmt.decodeStream && fmt.decodingStrategy) {
    const length = Number(resp.headers.get("content-length"));

    if (
      length === length
      && length > 0
      && fmt.decodingStrategy({ name: "fetch", length }) === "stream"
    ) {
      rpcResp = await fmt.decodeStream(resp.body, signal);
    } else {
      rpcResp = fmt.decodeSync(await resp.arrayBuffer());
    }
  } else {
    rpcResp = fmt.decodeSync(await resp.arrayBuffer());
  }

  if (!isRpcResponse(rpcResp) || "id" in rpcResp) {
    throw new ResponseError("Expected id-less rpc response.", {
      cause: Object.assign({ response: rpcResp }, cause),
    });
  }

  if ("result" in rpcResp) {
    return rpcResp.result;
  }

  throw new RpcResponseError(rpcResp, { cause });
}

interface RpcWithRequiredParams<M extends InlineRpcMethod> {
  // 配列とオブジェクトが引数の同じ場所にあると補完に難あり。
  // <T extends RpcResultMapping[M]>(
  //   endpoint: string | URL,
  //   method: M,
  //   params: RpcParams<M>,
  //   options?: InlineRpcOptions | undefined,
  // ): Promise<T>;
  /**
   * @experimental
   */
  <T extends RpcResultMapping[M]>(
    endpoint: string | URL,
    method: M,
    options: InlineRpcOptions & { readonly params: RpcParams<M> },
  ): Promise<T>;
}

interface RpcWithOptionalParams<M extends InlineRpcMethod> {
  // 配列とオブジェクトが引数の同じ場所にあると補完に難あり。
  // <T extends RpcResultMapping[M]>(
  //   endpoint: string | URL,
  //   method: M,
  //   params?: RpcParams<M>,
  //   options?: InlineRpcOptions | undefined,
  // ): Promise<T>;
  /**
   * @experimental
   */
  <T extends RpcResultMapping[M]>(
    endpoint: string | URL,
    method: M,
    options?:
      | (InlineRpcOptions & { readonly params?: RpcParams<M> })
      | undefined,
  ): Promise<T>;
}

export default rpc as UnionToIntersection<
  ValueOf<
    {
      [M in InlineRpcMethod]: undefined extends RpcParams<M>
        ? RpcWithOptionalParams<M>
        : RpcWithRequiredParams<M>;
    }
  >
>;
