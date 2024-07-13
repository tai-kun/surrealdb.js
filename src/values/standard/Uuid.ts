import { SurrealTypeError } from "~/errors";
import { isValidBytes } from "../_lib/uuid";
import Base from "../encodable/Uuid";

export default class Uuid extends Base {
  override get bytes() {
    return this._bytes;
  }

  override set bytes(v: Uint8Array) {
    if (!isValidBytes(v)) {
      throw new SurrealTypeError(`Invalid UUID: [${Array.from(v)}]`);
    }

    this._bytes = v;
  }
}
