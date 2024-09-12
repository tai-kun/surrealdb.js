import type { EncodedCBOR, EncodedJSON } from "@tai-kun/surrealdb/formatter";
import type { PreparedQueryLike, SlotLike } from "@tai-kun/surrealdb/types";

declare const NONE: unique symbol;

type None = typeof NONE;

const passthrough = (v: unknown): any => v;

export interface PreparedQueryOptions<
  T extends readonly unknown[] = any[],
  U = any,
> {
  readonly parse?: ((results: unknown[]) => T) | undefined;
  readonly trans?: ((results: T) => U) | undefined;
}

export default class PreparedQuery<
  S extends SlotLike,
  T extends unknown[] = unknown[],
  U = None,
> implements PreparedQueryLike {
  /** @deprecated */
  // @ts-expect-error 型だけ
  readonly __type: U extends None ? T : U;
  readonly _parse: (results: unknown[]) => T;
  readonly _trans: (results: T) => U;

  constructor(
    readonly text: string | EncodedJSON<string> | EncodedCBOR<string>,
    readonly vars: { readonly [p: string]: unknown },
    readonly slots: readonly S[],
    options: PreparedQueryOptions<T, U> = {},
  ) {
    this._parse = options.parse || passthrough;
    this._trans = options.trans || passthrough;
  }

  as<T extends unknown[] = unknown[]>(): PreparedQuery<S, T, U>;

  as<T extends unknown[] = unknown[]>(
    parser: (results: unknown[]) => T,
  ): PreparedQuery<S, T, U>;

  as(parser: (results: unknown[]) => T = this._parse): PreparedQuery<S, T, U> {
    const This = this.constructor as typeof PreparedQuery;

    return new This(this.text, this.vars, this.slots, {
      parse: parser,
      trans: this._trans,
    });
  }

  to<U>(transformer: (results: T) => U): PreparedQuery<S, T, U> {
    const This = this.constructor as typeof PreparedQuery;

    return new This(this.text, this.vars, this.slots, {
      parse: this._parse,
      trans: transformer,
    });
  }
}
