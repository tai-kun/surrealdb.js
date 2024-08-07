import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
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
import req, {
  type InlineRpcRequest,
  type InlineRpcRequestOptions,
} from "./rpc";

type RpcRequestOptions = Omit<InlineRpcRequestOptions, "url">;

export type CreateRpcOptions =
  & Omit<RpcRequestOptions, "signal">
  & { readonly timeout?: number | undefined };

/**
 * @experimental
 */
// @dprint-ignore
export default function createRpc(
  endpoint: string | URL,
  options?: CreateRpcOptions | undefined,
): {
  <T extends RpcResultMapping["authenticate"]>(request: RpcAuthenticateRequest & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["create"]      >(request: RpcCreateRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["delete"]      >(request: RpcDeleteRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["info"]        >(request: RpcInfoRequest         & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["insert"]      >(request: RpcInsertRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["invalidate"]  >(request: RpcInvalidateRequest   & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["merge"]       >(request: RpcMergeRequest        & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["patch"]       >(request: RpcPatchRequest        & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["ping"]        >(request: RpcPingRequest         & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["query"]       >(request: RpcQueryRequest        & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["relate"]      >(request: RpcRelateRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["run"]         >(request: RpcRunRequest          & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["select"]      >(request: RpcSelectRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["signin"]      >(request: RpcSigninRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["signup"]      >(request: RpcSignupRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["unset"]       >(request: RpcUnsetRequest        & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["update"]      >(request: RpcUpdateRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["upsert"]      >(request: RpcUpsertRequest       & RpcRequestOptions): Promise<T>
  <T extends RpcResultMapping["version"]     >(request: RpcVersionRequest      & RpcRequestOptions): Promise<T>
} {
  const {
    timeout = 5000,
    ...defaults
  } = options || {}

  return async function rpc(request: Omit<InlineRpcRequest, "url">) {
    const {
      fetch = defaults.fetch,
      token: tokenProp,
      signal,
      database = defaults.database,
      formatter = defaults.formatter,
      namespace = defaults.namespace,
      ...rest
    } = request;

    if (defaults.token !== undefined && tokenProp !== undefined) {
      throw new SurrealTypeError("token === undefined", typeof tokenProp);
    }

    return await req(
      // @ts-expect-error
      {
        url: endpoint,
        fetch,
        token: defaults.token ?? tokenProp,
        signal: signal || getTimeoutSignal(timeout),
        database,
        formatter,
        namespace,
        ...rest
      }
    )
  }
}
