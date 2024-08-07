import type { InferSlotVars } from "@tai-kun/surrealdb/clients/standard";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import type { PreparedQueryLike, SlotLike } from "@tai-kun/surrealdb/types";
import { getTimeoutSignal } from "@tai-kun/surrealdb/utils";
import type { Simplify } from "type-fest";
import req, { type QueryOptions } from "./query";

type Override<T, U> = Simplify<Omit<T, keyof U> & U>;

export type CreateQueryOptions =
  & Omit<QueryOptions, "signal">
  & { readonly timeout?: number | undefined };

/**
 * @experimental
 */
export default function createQuery(
  endpoint: string | URL,
  options?: CreateQueryOptions | undefined,
): {
  query<T extends readonly unknown[] = unknown[]>(
    surql: string,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: QueryOptions | undefined,
  ): Promise<T>;
  query<T extends readonly unknown[]>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly (never | SlotLike<string, false>)[];
      readonly __type: T;
    }>,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: QueryOptions | undefined,
  ): Promise<T>;
  query<S extends SlotLike, T extends readonly unknown[]>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly S[];
      readonly __type: T;
    }>,
    vars: Simplify<InferSlotVars<S> & { readonly [p: string]: unknown }>,
    options?: QueryOptions | undefined,
  ): Promise<T>;
} {
  const {
    timeout = 5000,
    ...defaults
  } = options || {};

  // @ts-expect-error
  return async function query(
    surql: string | PreparedQueryLike,
    vars?: { readonly [p: string]: unknown } | undefined,
    options: QueryOptions | undefined = {},
  ) {
    const {
      fetch = defaults.fetch,
      token: tokenProp,
      signal,
      database = defaults.database,
      formatter = defaults.formatter,
      namespace = defaults.namespace,
    } = options;

    if (defaults.token !== undefined && tokenProp !== undefined) {
      throw new SurrealTypeError("token === undefined", typeof tokenProp);
    }

    return await req(endpoint, surql as string, vars, {
      fetch,
      token: defaults.token ?? tokenProp,
      signal: signal || getTimeoutSignal(timeout),
      database,
      formatter,
      namespace,
    });
  };
}
