import { quoteStr } from "~/index/escape";
import type { SurqlValueSerializer } from "../_lib/types";
import Base from "../tiny/Datetime";

export default class Datetime extends Base implements SurqlValueSerializer {
  toSurql(): string {
    return "d" + quoteStr(this.toISOString());
  }
}
