import {
  Thing as Base,
  type ThingIdSource,
  type ThingSource,
  type ThingTbSource,
} from "@tai-kun/surrealdb/data-types/encodable";
import type { TableLike } from "./table";

export type { ThingIdSource, ThingSource, ThingTbSource };

export default class Thing<
  TTb extends ThingTbSource = ThingTbSource,
  TId extends ThingIdSource = ThingIdSource,
> extends Base<TTb, TId> {
  // @ts-expect-error readonly を外すだけ。
  tb: TTb;
  // @ts-expect-error readonly を外すだけ。
  id: TId;

  constructor(source: ThingSource<TTb, TId>);

  constructor(tb: TTb | TableLike<TTb>, id: TId);

  constructor(
    ...args:
      | [ThingSource<TTb, TId>]
      | [tb: TTb | TableLike<TTb>, id: TId]
  ) {
    const source: readonly [TTb, TId] = args.length === 2
      ? [typeof args[0] === "string" ? args[0] : args[0].name, args[1]]
      : args[0];
    super(source);
  }

  clone(): this {
    const This = this.constructor as typeof Thing;

    return new This(this.tb, this.id) as this;
  }
}
