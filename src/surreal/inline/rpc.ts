import {
  processEndpoint,
  type ProcessEndpointOptions,
  processQueryRequest,
} from "@tai-kun/surrealdb/engine";
import {
  MissingNamespaceError,
  RpcResponseError,
  ServerResponseError,
  SurrealTypeError,
} from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import type { HttpFetcherRequestInit } from "@tai-kun/surrealdb/http-engine";
import JsonFormatter from "@tai-kun/surrealdb/json-formatter";
import type { Jwt } from "@tai-kun/surrealdb/standard-client";
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
  | "insert_relation"
  | "invalidate"
  | "merge"
  | "patch"
  | "ping"
  | "query"
  | "relate"
  | "run"
  | "graphql"
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
    throw new ServerResponseError(
      "Expected `Response` contains a non-null body.",
      {
        cause: Object.assign({ response: resp }, cause),
      },
    );
  }

  if (resp.status !== 200) {
    const message = await resp.text();
    throw new ServerResponseError(message, {
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
    throw new ServerResponseError("Expected id-less rpc response.", {
      cause: Object.assign({ response: rpcResp }, cause),
    });
  }

  if ("result" in rpcResp) {
    return rpcResp.result;
  }

  throw new RpcResponseError(rpcResp, { cause });
}

interface RpcWithRequiredParams<TMethod extends InlineRpcMethod> {
  // 配列とオブジェクトが引数の同じ場所にあると補完に難あり。
  // <T extends RpcResultMapping[TMethod]>(
  //   endpoint: string | URL,
  //   method: TMethod,
  //   params: RpcParams<TMethod>,
  //   options?: InlineRpcOptions | undefined,
  // ): Promise<T>;
  /**
   * @experimental
   */
  <T extends RpcResultMapping[TMethod]>(
    endpoint: string | URL,
    method: TMethod,
    options: InlineRpcOptions & { readonly params: RpcParams<TMethod> },
  ): Promise<T>;
}

interface RpcWithOptionalParams<TMethod extends InlineRpcMethod> {
  // 配列とオブジェクトが引数の同じ場所にあると補完に難あり。
  // <T extends RpcResultMapping[TMethod]>(
  //   endpoint: string | URL,
  //   method: TMethod,
  //   params?: RpcParams<TMethod>,
  //   options?: InlineRpcOptions | undefined,
  // ): Promise<T>;
  /**
   * @experimental
   */
  <T extends RpcResultMapping[TMethod]>(
    endpoint: string | URL,
    method: TMethod,
    options?:
      | (InlineRpcOptions & { readonly params?: RpcParams<TMethod> })
      | undefined,
  ): Promise<T>;
}

export default rpc as UnionToIntersection<
  ValueOf<
    {
      [TMethod in InlineRpcMethod]: undefined extends RpcParams<TMethod>
        ? RpcWithOptionalParams<TMethod>
        : RpcWithRequiredParams<TMethod>;
    }
  >
>;
