import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import type { RpcParams, RpcResultMapping } from "@tai-kun/surrealdb/types";
import { getTimeoutSignal } from "@tai-kun/surrealdb/utils";
import type { UnionToIntersection, ValueOf } from "type-fest";
import rpc_, { type InlineRpcMethod, type InlineRpcOptions } from "./rpc";

const callRpc = rpc_ as (
  endpoint: string | URL,
  method: InlineRpcMethod,
  options: InlineRpcOptions & {
    readonly params: RpcParams<InlineRpcMethod> | undefined;
  },
) => Promise<unknown>;

export type CreateInlineRpcOptions = Omit<InlineRpcOptions, "signal"> & {
  readonly timeout?: number | undefined;
};

interface RpcWithRequiredParams<M extends InlineRpcMethod> {
  <T extends RpcResultMapping[M]>(
    method: M,
    options: InlineRpcOptions & { readonly params: RpcParams<M> },
  ): Promise<T>;
}

interface RpcWithOptionalParams<M extends InlineRpcMethod> {
  <T extends RpcResultMapping[M]>(
    method: M,
    options?:
      | (InlineRpcOptions & { readonly params?: RpcParams<M> })
      | undefined,
  ): Promise<T>;
}

/**
 * @experimental
 */
export default function createRpc(
  endpoint: string | URL,
  options: CreateInlineRpcOptions | undefined = {},
): UnionToIntersection<
  ValueOf<
    {
      [M in InlineRpcMethod]: undefined extends RpcParams<M>
        ? RpcWithOptionalParams<M>
        : RpcWithRequiredParams<M>;
    }
  >
> {
  endpoint = new URL(endpoint); // copy
  const {
    timeout = 5000,
    ...defaults
  } = options || {};

  async function rpc(
    method: InlineRpcMethod,
    options:
      | (InlineRpcOptions & { readonly params?: any })
      | undefined = {},
  ): Promise<any> {
    const {
      fetch = defaults.fetch,
      token: tokenProp,
      params,
      signal,
      database = defaults.database,
      formatter = defaults.formatter,
      namespace = defaults.namespace,
    } = options;

    if (defaults.token !== undefined && tokenProp !== undefined) {
      throw new SurrealTypeError("token === undefined", typeof tokenProp);
    }

    const result = await callRpc(endpoint, method, {
      fetch,
      token: defaults.token ?? tokenProp,
      params,
      signal: signal || getTimeoutSignal(timeout),
      database,
      formatter,
      namespace,
    });

    return result;
  }

  return rpc;
}
