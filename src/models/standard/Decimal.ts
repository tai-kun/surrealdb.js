import DecimalJs from "decimal.js-light";
import { _defineAssertDecimal } from "../internal";

_defineAssertDecimal(DecimalJs.prototype);

export default DecimalJs;
