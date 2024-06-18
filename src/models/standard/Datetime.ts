import { quoteStr } from "../../escape";
import type { SurqlValueSerializer } from "../Serializer";
import Base from "../tiny/Datetime";

export default class Datetime extends Base implements SurqlValueSerializer {
  toSurql(): string {
    return "d" + quoteStr(this.toISOString());
  }
}
