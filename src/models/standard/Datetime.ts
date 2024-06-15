import type { SurqlValueSerializer } from "../../value";
import Base from "../tiny/Datetime";

export default class Datetime extends Base implements SurqlValueSerializer {
  override toJSON(): string {
    return this.toISOString();
  }

  toSurql(): `d"${string}"` {
    return `d"${this.toISOString()}"`;
  }
}
