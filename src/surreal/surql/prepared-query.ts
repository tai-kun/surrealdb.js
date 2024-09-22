import type { EncodedCBOR, EncodedJSON } from "@tai-kun/surrealdb/formatter";
import type { PreparedQueryLike, SlotLike } from "@tai-kun/surrealdb/types";

declare const NONE: unique symbol;

type None = typeof NONE;

const passthrough = (v: unknown): any => v;

export interface PreparedQueryOptions<
  TResults extends readonly unknown[] = any[],
  TTransformed = any,
> {
  readonly parse?: ((results: unknown[]) => TResults) | undefined;
  readonly trans?: ((results: TResults) => TTransformed) | undefined;
  readonly encodedText?:
    | string
    | EncodedJSON<string>
    | EncodedCBOR<string>
    | undefined;
}

export default class PreparedQuery<
  TSlot extends SlotLike,
  TResults extends unknown[] = unknown[],
  TTransformed = None,
> implements PreparedQueryLike {
  readonly text: string | EncodedJSON<string> | EncodedCBOR<string>;
  readonly originalText: string;

  // @ts-expect-error 型だけ
  readonly __type: TTransformed extends None ? TResults : TTransformed;
  readonly _parse: (results: unknown[]) => TResults;
  readonly _trans: (results: TResults) => TTransformed;

  constructor(
    text: string,
    readonly vars: { readonly [p: string]: unknown },
    readonly slots: readonly TSlot[],
    options: PreparedQueryOptions<TResults, TTransformed> = {},
  ) {
    this.text = options.encodedText || text;
    this.originalText = text;
    this._parse = options.parse || passthrough;
    this._trans = options.trans || passthrough;
  }

  /**
   * @alias {@link type}
   */
  as<TResults extends unknown[] = unknown[]>(): PreparedQuery<
    TSlot,
    TResults,
    TTransformed
  >;

  /**
   * @alias {@link type}
   */
  as<TResults extends unknown[] = unknown[]>(
    parser: (results: unknown[]) => TResults,
  ): PreparedQuery<TSlot, TResults, TTransformed>;

  as(
    parser: (results: unknown[]) => TResults = this._parse,
  ): PreparedQuery<TSlot, TResults, TTransformed> {
    const This = this.constructor as typeof PreparedQuery;

    return new This(this.originalText, this.vars, this.slots, {
      parse: parser,
      trans: this._trans,
      encodedText: this.text,
    });
  }

  /**
   * @alias {@link as}
   */
  type<TResults extends unknown[] = unknown[]>(): PreparedQuery<
    TSlot,
    TResults,
    TTransformed
  >;

  /**
   * @alias {@link as}
   */
  type<TResults extends unknown[] = unknown[]>(
    parser: (results: unknown[]) => TResults,
  ): PreparedQuery<TSlot, TResults, TTransformed>;

  type(parser = this._parse): PreparedQuery<SlotLike, any, any> {
    return this.as(parser);
  }

  /**
   * @alias {@link transform}
   */
  to<TTransformed>(
    transformer: (results: TResults) => TTransformed,
  ): PreparedQuery<TSlot, TResults, TTransformed> {
    const This = this.constructor as typeof PreparedQuery;

    return new This(this.originalText, this.vars, this.slots, {
      parse: this._parse,
      trans: transformer,
      encodedText: this.text,
    });
  }

  /**
   * @alias {@link to}
   */
  transform<TTransformed>(
    transformer: (results: TResults) => TTransformed,
  ): PreparedQuery<TSlot, TResults, TTransformed> {
    return this.to(transformer);
  }
}
