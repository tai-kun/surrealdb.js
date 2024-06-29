import DecimalJs from "decimal.js-light";
import { _defineAssertDecimal } from "../../_values/internal";
import type { SurqlValueSerializer } from "../../_values/Serializer";

declare module "decimal.js-light" {
  export interface Decimal extends Pick<SurqlValueSerializer, "toSurql"> {}
}

_defineAssertDecimal(DecimalJs.prototype);
Object.assign(DecimalJs.prototype, {
  toSurql(this: DecimalJs): string {
    return this.valueOf() + "dec";
  },
});

export default DecimalJs;
