import Encoded from "./encoded";

export default class EncodedJSON<T = unknown, B = unknown> extends Encoded<T> {
  readonly toJSON: () => unknown; // toRawJSON に対応していない場合に備える
  readonly toRawJSON?: () => string;

  constructor(
    bindings: B,
    toJSON: (this: B) => unknown, // toRawJSON に対応していない場合に備える
    toRawJSON?: ((this: B) => string) | undefined,
  ) {
    super();
    this.toJSON = toJSON.bind(bindings);

    if (toRawJSON) {
      this.toRawJSON = toRawJSON.bind(bindings);
    }
  }
}
