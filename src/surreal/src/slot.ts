import type { SlotLike } from "@tai-kun/surrealdb/types";

export default class Slot<
  N extends string = any,
  R extends boolean = any,
  V = any,
> implements SlotLike {
  constructor(
    readonly name: N,
    readonly isRequired: R,
    readonly defaultValue?: V,
  ) {}

  type<TBind extends V>(): Slot<N, R, TBind> {
    return this as any;
  }

  rename<const N extends string>(
    name: N,
  ): Slot<N, R, V> {
    const This = this.constructor as typeof Slot;

    return "defaultValue" in this
      ? new This(name, this.isRequired, this.defaultValue)
      : new This(name, this.isRequired);
  }

  default(defaultValue: V): Slot<N, false, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false, defaultValue);
  }

  optional(): Slot<N, false, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, false);
  }

  required(): Slot<N, true, V> {
    const This = this.constructor as typeof Slot;

    return new This(this.name, true);
  }
}
