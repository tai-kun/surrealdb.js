import type { ToCBOR } from "@tai-kun/surrealdb/cbor";
import Encoded from "./encoded";

export default class EncodedCBOR<TData = unknown, TBind = unknown>
  extends Encoded<TData>
  implements ToCBOR
{
  readonly toCBOR: ToCBOR["toCBOR"];

  constructor(
    bindings: TBind,
    toCBOR: (
      this: TBind,
      ...args: Parameters<ToCBOR["toCBOR"]>
    ) => ReturnType<ToCBOR["toCBOR"]>,
  ) {
    super();
    this.toCBOR = toCBOR.bind(bindings);
  }
}
