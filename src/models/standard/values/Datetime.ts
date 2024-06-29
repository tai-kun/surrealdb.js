import { quoteStr } from "../../../common/escape";
import type { SurqlValueSerializer } from "../../_values/Serializer";
import Base from "../../tiny/values/Datetime";

export default class Datetime extends Base implements SurqlValueSerializer {
  toSurql(): string {
    return "d" + quoteStr(this.toISOString());
  }
}
