declare const SLOT_SYMBOL: unique symbol;

export default class Slot<
  const TName extends string = any,
  TRequired extends boolean = any,
  TValue = any,
> {
  /** @deprecated */
  // @ts-expect-error 値を設定しない。型だけ。
  readonly _: typeof SLOT_SYMBOL;

  constructor(
    readonly name: TName,
    readonly isRequired: TRequired,
    readonly defaultValue?: TValue,
  ) {}

  type<TBind extends TValue>(): Slot<TName, TRequired, TBind> {
    return this as any;
  }

  rename<const TName extends string>(
    name: TName,
  ): Slot<TName, TRequired, TValue> {
    const This = this.constructor as typeof Slot;
    return new This(name, this.isRequired, this.defaultValue);
  }

  default(defaultValue: TValue): Slot<TName, false, TValue> {
    const This = this.constructor as typeof Slot;
    return new This(this.name, false, defaultValue);
  }

  optional(): Slot<TName, false, TValue> {
    const This = this.constructor as typeof Slot;
    return new This(this.name, false);
  }

  required(): Slot<TName, true, TValue> {
    const This = this.constructor as typeof Slot;
    return new This(this.name, true);
  }
}
