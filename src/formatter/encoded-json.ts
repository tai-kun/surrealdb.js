import Encoded from "./encoded";

export default class EncodedJSON<TData = unknown, TBind = unknown>
  extends Encoded<TData>
{
  readonly toJSON: () => unknown; // toRawJSON に対応していない場合に備える
  readonly toRawJSON?: () => string;

  constructor(
    bindings: TBind,
    toJSON: (this: TBind) => unknown, // toRawJSON に対応していない場合に備える
    toRawJSON?: ((this: TBind) => string) | undefined,
  ) {
    super();
    this.toJSON = toJSON.bind(bindings);

    if (toRawJSON) {
      this.toRawJSON = toRawJSON.bind(bindings);
    }
  }
}
