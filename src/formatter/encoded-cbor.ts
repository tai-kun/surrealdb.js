import type { ToCBOR } from "@tai-kun/surrealdb/cbor";
import Encoded from "./encoded";

export default class EncodedCBOR<T = unknown, B = unknown> extends Encoded<T>
  implements ToCBOR
{
  readonly toCBOR: ToCBOR["toCBOR"];

  constructor(
    bindings: B,
    toCBOR: (
      this: B,
      ...args: Parameters<ToCBOR["toCBOR"]>
    ) => ReturnType<ToCBOR["toCBOR"]>,
  ) {
    super();
    this.toCBOR = toCBOR.bind(bindings);
  }
}
