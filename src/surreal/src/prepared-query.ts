import type { PreparedQueryLike, SlotLike } from "@tai-kun/surrealdb/types";

const passthrough = (v: unknown): any => v;

export default class PreparedQuery<
  S extends SlotLike,
  T extends readonly unknown[] = unknown[],
> implements PreparedQueryLike {
  /** @deprecated */
  // @ts-expect-error 型だけ
  readonly __type: T;

  constructor(
    readonly text: string | { readonly __type: string },
    readonly vars: { readonly [p: string]: unknown },
    readonly slots: readonly S[],
    readonly parse: (results: unknown[]) => T = passthrough,
  ) {}

  returns<T extends readonly unknown[] = unknown[]>(): PreparedQuery<S, T>;

  returns<T extends readonly unknown[] = unknown[]>(
    parse: (results: unknown[]) => T,
  ): PreparedQuery<S, T>;

  returns(parse: (results: unknown[]) => T = this.parse): PreparedQuery<S, T> {
    const This = this.constructor as typeof PreparedQuery;

    return new This<S, T>(this.text, this.vars, this.slots, parse);
  }
}
