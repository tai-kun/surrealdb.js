import {
  CBOR_TAG_DECIMAL,
  type Encodable,
} from "@tai-kun/surrealdb/encodable-datatypes";
import { Big } from "big.js";
import { defineAsDecimal } from "../_internals/define";

export type DecimalRoundingMode = 0 | 1 | 2 | 3;

export interface DecimalConstructor {
  ///////////////////////////////////////////
  // CONSTRUCTOR                           //
  // https://mikemcl.github.io/big.js/#big //
  ///////////////////////////////////////////

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#big)
   */
  new(source: string | number | Decimal): Decimal;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#big)
   */
  (source: string | number | Decimal): Decimal;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#big)
   */
  (source?: undefined): DecimalConstructor;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#dp)
   */
  DP: number;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#rm)
   */
  RM: number;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#eneg)
   */
  NE: number;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#epos)
   */
  PE: number;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#strict)
   */
  strict: boolean;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#rm)
   */
  readonly roundDown: 0;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#rm)
   */
  readonly roundHalfUp: 1;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#rm)
   */
  readonly roundHalfEven: 2;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#rm)
   */
  readonly roundUp: 3;
}

interface Decimal extends Encodable {
  /////////////////////////////////////////////////////////
  // METHODS                                             //
  // https://mikemcl.github.io/big.js/#prototype-methods //
  /////////////////////////////////////////////////////////

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#abs)
   */
  abs(): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#add)
   */
  add(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#cmp)
   */
  cmp(n: string | number | Decimal): -1 | 0 | 1;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#div)
   */
  div(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#eq)
   */
  eq(n: string | number | Decimal): boolean;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#gt)
   */
  gt(n: string | number | Decimal): boolean;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#gte)
   */
  gte(n: string | number | Decimal): boolean;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#lt)
   */
  lt(n: string | number | Decimal): boolean;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#lte)
   */
  lte(n: string | number | Decimal): boolean;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#minus)
   */
  minus(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#mod)
   */
  mod(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#mul)
   */
  mul(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#neg)
   */
  neg(): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#plus)
   */
  plus(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#pow)
   */
  pow(exp: number): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#prec)
   */
  prec(sd: number, rm?: DecimalRoundingMode): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#round)
   */
  round(dp?: number, rm?: DecimalRoundingMode): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#sqrt)
   */
  sqrt(): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#sub)
   */
  sub(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#times)
   */
  times(n: string | number | Decimal): this;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#toExponential)
   */
  toExponential(dp?: number, rm?: DecimalRoundingMode): string;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#toFixed)
   */
  toFixed(dp?: number, rm?: DecimalRoundingMode): string;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#toPrecision)
   */
  toPrecision(sd?: number, rm?: DecimalRoundingMode): string;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#toString)
   */
  toString(): string;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#toNumber)
   */
  toNumber(): number;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#valueOf)
   */
  valueOf(): string;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#toJSON)
   */
  toJSON(): string;

  ///////////////////////////////////////////////////////////
  // PROPERTIES                                            //
  // https://mikemcl.github.io/big.js/#instance-properties //
  ///////////////////////////////////////////////////////////

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#coefficient)
   */
  c: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#exponent)
   */
  e: number;

  /**
   * [API Reference](https://mikemcl.github.io/big.js/#sign)
   */
  s: -1 | 1;

  ///////////////
  // ENCODABLE //
  ///////////////

  [Symbol.toPrimitive]: {
    (hint: "default" | "string"): string;
    (hint: "number"): number;
    (hint: string): string | number;
  };

  toCBOR(): [
    tag: typeof CBOR_TAG_DECIMAL,
    value: string,
  ];

  toPlainObject(): {
    value: string;
    singleDigits: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    /** Integer, -1e+6 ~ 1e+6 */
    exponent: number;
    sign: -1 | 1;
  };

  clone(): this;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/decimal)
 */
const Decimal = /* @__PURE__ */ Big() as unknown as DecimalConstructor;

/* @__PURE__ */ defineAsDecimal(Decimal.prototype);
/* @__PURE__ */ Object.assign<
  any,
  Pick<
    Decimal,
    | typeof Symbol.toPrimitive
    | "toCBOR"
    | "toSurql"
    | "toPlainObject"
    | "clone"
  >
>(Decimal.prototype, {
  [Symbol.toPrimitive](this: Big, hint: string): any {
    switch (hint) {
      case "number":
        return this.toNumber();

      case "string":
      case "default":
        return this.toString();

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  },
  toCBOR(this: Decimal): [
    tag: typeof CBOR_TAG_DECIMAL,
    value: string,
  ] {
    return [
      CBOR_TAG_DECIMAL,
      this.toString(),
    ];
  },
  toSurql(this: Decimal): string {
    return this.toString() + "dec";
  },
  toPlainObject(this: Decimal): {
    value: string;
    singleDigits: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    exponent: number;
    sign: -1 | 1;
  } {
    return {
      sign: this.s,
      value: this.toString(),
      exponent: this.e,
      singleDigits: this.c.slice(), // copy
    };
  },
  clone(this: Decimal) {
    const This = this.constructor as typeof Decimal;

    return new This(this.toString());
  },
});

export default Decimal;
