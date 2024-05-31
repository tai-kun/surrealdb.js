import DecimalJs from "decimal.js-light";
import { _defineAssertDecimal } from "../utils";

// Unlike when defining Decimal as a class,
// if we don't export the type definition at the same time,
// we will need to use `typeof Decimal` every time we reference the type.
export type Decimal = DecimalJs;

/**
 * A class representing a decimal.
 * This class is a wrapper around the `Decimal` class from the `decimal.js-light` package.
 *
 * @see https://mikemcl.github.io/decimal.js-light/
 */
// Create a clone of Decimal to prevent global patching.
export const Decimal = /* @__PURE__ */ DecimalJs.clone();

// However, since the prototype still references global values,
// we will take a shallow copy of it before applying the patch.
/* @__PURE__ */ _defineAssertDecimal(
  // @ts-expect-error
  Decimal.prototype = { ...Decimal.prototype },
);
