import type { InferSlotVars } from "@tai-kun/surrealdb/clients/standard";
import type { PreparedQueryLike } from "@tai-kun/surrealdb/types";

export type InferQueryResult<
  Q extends PreparedQueryLike,
> = Q extends { readonly __type: infer T } ? T : unknown;

export type InferQueryArgs<
  Q extends PreparedQueryLike,
> = InferSlotVars<Q["slots"][number]>;
