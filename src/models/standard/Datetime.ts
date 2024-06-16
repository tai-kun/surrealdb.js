import type { SurqlValueSerializer } from "../Serializer";
import Base from "../tiny/Datetime";

export default class Datetime extends Base implements SurqlValueSerializer {
  toSurql(): `d"${string}"` {
    return `d"${this.toISOString()}"`;
  }
}
