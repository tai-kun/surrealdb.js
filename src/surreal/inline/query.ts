import type { InferSlotVars } from "@tai-kun/surrealdb/clients/standard";
import { QueryFailedError } from "@tai-kun/surrealdb/errors";
import type { PreparedQueryLike, SlotLike } from "@tai-kun/surrealdb/types";
import type { Simplify } from "type-fest";
import rpc, { type InlineRpcOptions } from "./rpc";

type Override<T, U> = Simplify<Omit<T, keyof U> & U>;

export type InlineQueryOptions = InlineRpcOptions;

/**
 * @experimental
 */
function query<TResults extends readonly unknown[] = unknown[]>(
  endpoint: string | URL,
  surql: string,
  vars?: { readonly [p: string]: unknown } | undefined,
  options?: InlineQueryOptions | undefined,
): Promise<TResults>;

/**
 * @experimental
 */
function query<TType>(
  endpoint: string | URL,
  surql: Override<PreparedQueryLike, {
    readonly slots: readonly (never | SlotLike<string, false>)[];
    readonly __type: TType;
  }>,
  vars?: { readonly [p: string]: unknown } | undefined,
  options?: InlineQueryOptions | undefined,
): Promise<TType>;

/**
 * @experimental
 */
function query<TSlot extends SlotLike, TType>(
  endpoint: string | URL,
  surql: Override<PreparedQueryLike, {
    readonly slots: readonly TSlot[];
    readonly __type: TType;
  }>,
  vars: Simplify<InferSlotVars<TSlot> & { readonly [p: string]: unknown }>,
  options?: InlineQueryOptions | undefined,
): Promise<TType>;

async function query(
  endpoint: string | URL,
  surql: string | PreparedQueryLike,
  vars?: { readonly [p: string]: unknown } | undefined,
  options?: InlineQueryOptions | undefined,
): Promise<unknown> {
  const results = await rpc(
    endpoint,
    "query",
    Object.assign({ params: [surql, vars] as const }, options),
  );
  const output: unknown[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "OK") {
      output.push(result.result);
    } else {
      errors.push(result.result);
    }
  }

  if (errors.length > 0) {
    throw new QueryFailedError(errors);
  }

  if (typeof surql === "string") {
    return output;
  }

  return surql._trans(surql._parse(output));
}

export default query;
