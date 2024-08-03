import {
  MissingNamespaceError,
  ResponseError,
  RpcResponseError,
  SurrealTypeError,
} from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import type {
  RpcAuthenticateRequest,
  RpcCreateRequest,
  RpcDeleteRequest,
  RpcInfoRequest,
  RpcInsertRequest,
  RpcInvalidateRequest,
  RpcMergeRequest,
  RpcPatchRequest,
  RpcPingRequest,
  RpcQueryRequest,
  RpcRelateRequest,
  RpcResultMapping,
  RpcRunRequest,
  RpcSelectRequest,
  RpcSigninRequest,
  RpcSignupRequest,
  RpcUnsetRequest,
  RpcUpdateRequest,
  RpcUpsertRequest,
  RpcVersionRequest,
} from "@tai-kun/surrealdb/types";
import { getTimeoutSignal } from "@tai-kun/surrealdb/utils";
import { isRpcResponse } from "@tai-kun/surrealdb/validator";

export type InlineRpcFetcherRequestInit = {
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
};

export type InlineRpcFetcher = (
  input: string,
  init: InlineRpcFetcherRequestInit,
) => Response | PromiseLike<Response>;

type InlineRpcRequestOptions = {
  readonly url: string | URL; // Request["url"]

  readonly formatter?: Formatter | undefined;
  readonly namespace?: string | undefined;
  readonly database?: string | undefined;
  readonly token?: string | undefined;

  readonly fetch?: InlineRpcFetcher | undefined;
  readonly signal?: AbortSignal | undefined;
};

export type InlineRpcRequest =
  & (
    | RpcAuthenticateRequest
    | RpcCreateRequest
    | RpcDeleteRequest
    | RpcInfoRequest
    | RpcInsertRequest
    | RpcInvalidateRequest
    | RpcMergeRequest
    | RpcPatchRequest
    | RpcPingRequest
    | RpcQueryRequest
    | RpcRelateRequest
    | RpcRunRequest
    | RpcSelectRequest
    | RpcSigninRequest
    | RpcSignupRequest
    | RpcUnsetRequest
    | RpcUpdateRequest
    | RpcUpsertRequest
    | RpcVersionRequest
  )
  & InlineRpcRequestOptions;

async function rpc(request: InlineRpcRequest): Promise<unknown> {
  const {
    url,
    fetch: get = globalThis.fetch satisfies InlineRpcFetcher,
    token,
    signal = getTimeoutSignal(5_000),
    database: db,
    formatter: fmt = new JsonFormatter() as never,
    namespace: ns,
    ...rpcRequest
  } = request;

  if (ns == null && db != null) {
    throw new MissingNamespaceError(db);
  }

  if (!fmt.mimeType) {
    throw new SurrealTypeError("non-empty string", String(fmt.mimeType));
  }

  if (rpcRequest.method === "query") {
    const [arg0, vars] = rpcRequest.params;
    const surql = typeof arg0 === "string" ? { text: arg0 } : arg0;
    rpcRequest.params = [surql.text, { ...surql.vars, ...vars }];
  }

  const body: unknown = fmt.encodeSync({
    method: rpcRequest.method,
    params: rpcRequest.params || [],
  });

  if (typeof body !== "string" && !(body instanceof Uint8Array)) {
    throw new SurrealTypeError("string | Uint8Array", String(body));
  }

  const endpoint = new URL(url);

  if (!endpoint.pathname.endsWith("/rpc")) {
    if (!endpoint.pathname.endsWith("/")) {
      endpoint.pathname += "/";
    }

    endpoint.pathname += "rpc";
  }

  const resp = await get(endpoint.href, {
    body,
    method: "POST",
    signal,
    headers: {
      Accept: fmt.mimeType,
      "Content-Type": fmt.mimeType,
      ...(ns != null ? { "Surreal-NS": ns } : {}),
      ...(db != null ? { "Surreal-DB": db } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const cause = {
    method: rpcRequest.method,
    // TODO(tai-kun): params には機微情報が含まれている可能性があるので、method のみにしておく？
    params: rpcRequest.params,
    endpoint: endpoint.href,
    database: db,
    namespace: ns,
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

  if (fmt.decode) {
    rpcResp = await fmt.decode({
      reader: resp.body.getReader(),
      signal,
    });
  } else {
    rpcResp = fmt.decodeSync(await resp.arrayBuffer());
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
    return rpcResp.result;
  }

  throw new RpcResponseError(rpcResp, {
    cause: {
      method: rpcRequest.method,
      // TODO(tai-kun): params には機微情報が含まれている可能性があるので、method のみにしておく？
      params: rpcRequest.params,
    },
  });
}

// @dprint-ignore
export default rpc as {
  <T extends RpcResultMapping["authenticate"]>(request: RpcAuthenticateRequest & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["create"]      >(request: RpcCreateRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["delete"]      >(request: RpcDeleteRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["info"]        >(request: RpcInfoRequest         & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["insert"]      >(request: RpcInsertRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["invalidate"]  >(request: RpcInvalidateRequest   & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["merge"]       >(request: RpcMergeRequest        & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["patch"]       >(request: RpcPatchRequest        & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["ping"]        >(request: RpcPingRequest         & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["query"]       >(request: RpcQueryRequest        & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["relate"]      >(request: RpcRelateRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["run"]         >(request: RpcRunRequest          & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["select"]      >(request: RpcSelectRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["signin"]      >(request: RpcSigninRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["signup"]      >(request: RpcSignupRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["unset"]       >(request: RpcUnsetRequest        & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["update"]      >(request: RpcUpdateRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["upsert"]      >(request: RpcUpsertRequest       & InlineRpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["version"]     >(request: RpcVersionRequest      & InlineRpcRequestOptions): Promise<T>
};
