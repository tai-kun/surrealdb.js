import type { SlotLike } from "@tai-kun/surrealdb/types";
import type { Writable } from "type-fest";

const passthrough = (v: unknown): any => v;

export interface SlotOptions<V = any> {
  readonly parse?: ((value: unknown) => V) | undefined;
  readonly defaultValue?: V;
}

export default class Slot<
  N extends string = any,
  R extends boolean = any,
  V = any,
> implements SlotLike {
  readonly parse: (value: unknown) => V;
  readonly defaultValue?: V;

  constructor(
    readonly name: N,
    readonly isRequired: R,
    options: SlotOptions<V> = {},
  ) {
    this.parse = options.parse || passthrough;

    if ("defaultValue" in options) {
      this.defaultValue = options.defaultValue;
    }
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

    return new This(name, this.isRequired, this);
  }

  default(defaultValue: V): Slot<N, false, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false, {
      parse: this.parse,
      defaultValue: defaultValue,
      // TODO(tai-kun): ここでパースする必要あるか検討 (高コストだけどコンストラクター内でやる？)
      // defaultValue: this.parse(defaultValue),
    });
  }

  optional(): Slot<N, false, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false, this);
  }

  required(): Slot<N, true, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, true, this);
  }
}
