import type { PreparedQueryLike, SlotLike } from "@tai-kun/surrealdb/types";

export default class PreparedQuery<
  S extends SlotLike,
  T extends readonly unknown[] = unknown[],
> implements PreparedQueryLike {
  /** @deprecated */
  // @ts-expect-error 型だけ
  readonly __type: T;

  constructor(
    readonly text: string,
    readonly vars: { readonly [p: string]: unknown },
    readonly slots: readonly S[],
  ) {}

  returns<T extends readonly unknown[] = unknown[]>(): PreparedQuery<S, T> {
    const This = this.constructor as typeof PreparedQuery;

    return new This<S, T>(this.text, this.vars, this.slots);
  }
}
