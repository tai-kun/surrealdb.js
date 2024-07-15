import { SurrealTypeError } from "@tai-kun/surreal/errors";
import { isValidBytes } from "../../_shared/Uuid";
import Base from "../../encodable/src/Uuid";

export default class Uuid extends Base {
  override get bytes(): Uint8Array {
    return this._bytes;
  }

  override set bytes(v: Uint8Array) {
    if (!isValidBytes(v)) {
      throw new SurrealTypeError(`Invalid UUID: [${Array.from(v)}]`);
    }

    this._bytes = v;
  }
}
