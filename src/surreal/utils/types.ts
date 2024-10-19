import type { InferSlotVars } from "@tai-kun/surrealdb/standard-client";
import type { PreparedQueryLike } from "@tai-kun/surrealdb/types";

export type InferQueryResult<
  TPreparedQuery extends PreparedQueryLike,
> = TPreparedQuery extends { readonly __type: infer T } ? T : unknown;

export type InferQueryArgs<
  TPreparedQuery extends PreparedQueryLike,
> = InferSlotVars<TPreparedQuery["slots"][number]>;
