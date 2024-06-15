import DecimalJs from "decimal.js";
import { _defineAssertDecimal } from "../internal";

_defineAssertDecimal(DecimalJs.prototype);

export default DecimalJs;
