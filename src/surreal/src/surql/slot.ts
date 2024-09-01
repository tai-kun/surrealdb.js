import type { Encoded, Formatter } from "@tai-kun/surrealdb/formatter";
import type { SlotLike } from "@tai-kun/surrealdb/types";
import type { Writable } from "type-fest";

const passthrough = (v: unknown): any => v;

export interface SlotOptions<V = any> {
  readonly parse?: ((value: unknown) => V) | undefined;
  readonly formatter?: Formatter | undefined;
  readonly defaultValue?: V | Encoded<V>;
}

export default class Slot<
  N extends string = any,
  R extends boolean = any,
  V = any,
> implements SlotLike {
  protected readonly fmt?: Formatter;

  readonly _parse: (value: unknown) => V;
  readonly defaultValue?: V | Encoded<V>;

  constructor(
    readonly name: N,
    readonly isRequired: R,
    options: SlotOptions<V> = {},
  ) {
    this._parse = options.parse || passthrough;

    if (options.formatter) {
      this.fmt = options.formatter;
    }

    if ("defaultValue" in options) {
      this.defaultValue = options.defaultValue;
    }
  }

  protected toOptions(): SlotOptions<V> {
    const options: Writable<SlotOptions> = {
      parse: this._parse,
      formatter: this.fmt,
    };

    if ("defaultValue" in this) {
      options.defaultValue = this.defaultValue;
    }

    return options;
  }

  type<TBind extends V>(): Slot<N, true, TBind>;

  type<TBind extends V>(parse: (value: unknown) => TBind): Slot<N, true, TBind>;

  type(parse: (value: unknown) => unknown = v => v): Slot<N, true> {
    const This = this.constructor as typeof Slot;
    const options: Writable<SlotOptions> = { parse };

    if ("defaultValue" in this) {
      options.defaultValue = this.defaultValue;
      // TODO(tai-kun): ここでパースする必要あるか検討 (高コストだけどコンストラクター内でやる？)
      // options.defaultValue = parse(this.defaultValue);
    }

    return new This(this.name, true, options);
  }

  rename<const N extends string>(
    name: N,
  ): Slot<N, R, V> {
    const This = this.constructor as typeof Slot;

    return new This(name, this.isRequired, this.toOptions());
  }

  default(defaultValue: V): Slot<N, false, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false, {
      parse: this._parse,
      formatter: this.fmt,
      defaultValue: this.fmt?.toEncoded?.(defaultValue) || defaultValue,
      // TODO(tai-kun): ここでパースする必要あるか検討 (高コストだけどコンストラクター内でやる？)
      // defaultValue: this.parse(defaultValue),
    });
  }

  optional(): Slot<N, false, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false, {
      parse: this._parse,
      formatter: this.fmt,
    });
  }

  required(): Slot<N, true, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, true, {
      parse: this._parse,
      formatter: this.fmt,
    });
  }
}
