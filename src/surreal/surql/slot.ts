import type { Encoded, Formatter } from "@tai-kun/surrealdb/formatter";
import type { SlotLike } from "@tai-kun/surrealdb/types";
import type { Writable } from "type-fest";

const passthrough = (v: unknown): any => v;

export interface SlotOptions<TValue = any> {
  readonly parse?: ((value: unknown) => TValue) | undefined;
  readonly formatter?: Formatter | undefined;
  readonly defaultValue?: TValue | Encoded<TValue>;
}

export default class Slot<
  TName extends string = any,
  TRequired extends boolean = any,
  TValue = any,
> implements SlotLike {
  protected readonly fmt?: Formatter;

  readonly _parse: (value: unknown) => TValue;
  readonly defaultValue?: TValue | Encoded<TValue>;

  constructor(
    readonly name: TName,
    readonly isRequired: TRequired,
    options: SlotOptions<TValue> = {},
  ) {
    this._parse = options.parse || passthrough;

    if (options.formatter) {
      this.fmt = options.formatter;
    }

    if ("defaultValue" in options) {
      this.defaultValue = options.defaultValue;
    }
  }

  protected toOptions(): SlotOptions<TValue> {
    const options: Writable<SlotOptions> = {
      parse: this._parse,
      formatter: this.fmt,
    };

    if ("defaultValue" in this) {
      options.defaultValue = this.defaultValue;
    }

    return options;
  }

  as<TBind extends TValue>(): Slot<TName, true, TBind>;

  as<TBind extends TValue>(
    parser: (value: unknown) => TBind,
  ): Slot<TName, true, TBind>;

  as(parser: (value: unknown) => unknown = v => v): Slot<TName, true> {
    const This = this.constructor as typeof Slot;
    const options: Writable<SlotOptions> = { parse: parser };

    if ("defaultValue" in this) {
      options.defaultValue = this.defaultValue;
      // TODO(tai-kun): ここでパースする必要あるか検討 (高コストだけどコンストラクター内でやる？)
      // options.defaultValue = parser(this.defaultValue);
    }

    return new This(this.name, true, options);
  }

  rename<const TName extends string>(
    name: TName,
  ): Slot<TName, TRequired, TValue> {
    const This = this.constructor as typeof Slot;

    return new This(name, this.isRequired, this.toOptions());
  }

  default(defaultValue: TValue): Slot<TName, false, TValue> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false, {
      parse: this._parse,
      formatter: this.fmt,
      defaultValue: this.fmt?.toEncoded?.(defaultValue) || defaultValue,
      // TODO(tai-kun): ここでパースする必要あるか検討 (高コストだけどコンストラクター内でやる？)
      // defaultValue: this._parse(defaultValue),
    });
  }

  optional(): Slot<TName, false, TValue> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false, {
      parse: this._parse,
      formatter: this.fmt,
    });
  }

  required(): Slot<TName, true, TValue> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, true, {
      parse: this._parse,
      formatter: this.fmt,
    });
  }
}
