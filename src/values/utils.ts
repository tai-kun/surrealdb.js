import type { Primitive } from "type-fest";
import { SurrealDbError } from "../common/errors";
import type {
  Datetime as FullyDatetime,
  Decimal as FullyDecimal,
  Duration as FullyDuration,
  GeometryCollection as FullyGeometryCollection,
  GeometryLine as FullyGeometryLine,
  GeometryMultiLine as FullyGeometryMultiLine,
  GeometryMultiPoint as FullyGeometryMultiPoint,
  GeometryMultiPolygon as FullyGeometryMultiPolygon,
  GeometryPoint as FullyGeometryPoint,
  GeometryPolygon as FullyGeometryPolygon,
  Table as FullyTable,
  Thing as FullyThing,
  Uuid as FullyUuid,
} from "./full";
import type {
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  Uuid,
} from "./normal";
import type {
  Datetime as TinyDatetime,
  Decimal as TinyDecimal,
  Duration as TinyDuration,
  GeometryCollection as TinyGeometryCollection,
  GeometryLine as TinyGeometryLine,
  GeometryMultiLine as TinyGeometryMultiLine,
  GeometryMultiPoint as TinyGeometryMultiPoint,
  GeometryMultiPolygon as TinyGeometryMultiPolygon,
  GeometryPoint as TinyGeometryPoint,
  GeometryPolygon as TinyGeometryPolygon,
  Table as TinyTable,
  Thing as TinyThing,
  Uuid as TinyUuid,
} from "./tiny";

/******************************************************************************
 * Datetime
 *****************************************************************************/

export type AnyDatetime = Datetime | FullyDatetime | TinyDatetime;

const storeDatetime = new Map();

export const _defineAssertDatetime = (value: AnyDatetime) =>
  defineAssertValue(storeDatetime, value);

// @ts-expect-error
export const isDatetime: IsValue<AnyDatetime> = value =>
  isValue(storeDatetime, value);

/******************************************************************************
 * Decimal
 *****************************************************************************/

export type AnyDecimal = Decimal | FullyDecimal | TinyDecimal;

const storeDecimal = new Map();

export const _defineAssertDecimal = (value: AnyDecimal) =>
  defineAssertValue(storeDecimal, value);

// @ts-expect-error
export const isDecimal: IsValue<AnyDecimal> = value =>
  isValue(storeDecimal, value);

/******************************************************************************
 * Duration
 *****************************************************************************/

export type AnyDuration = Duration | FullyDuration | TinyDuration;

const storeDuration = new Map();

export const _defineAssertDuration = (value: AnyDuration) =>
  defineAssertValue(storeDuration, value);

// @ts-expect-error
export const isDuration: IsValue<AnyDuration> = value =>
  isValue(storeDuration, value);

/******************************************************************************
 * GeometryPoint
 *****************************************************************************/

export type AnyGeometryPoint =
  | GeometryPoint
  | FullyGeometryPoint
  | TinyGeometryPoint;

const storeGeometryPoint = new Map();

export const _defineAssertGeometryPoint = (value: AnyGeometryPoint) =>
  defineAssertValue(storeGeometryPoint, value);

// @ts-expect-error
export const isGeometryPoint: IsValue<AnyGeometryPoint> = value =>
  isValue(storeGeometryPoint, value);

/******************************************************************************
 * GeometryLine
 *****************************************************************************/

export type AnyGeometryLine =
  | GeometryLine
  | FullyGeometryLine
  | TinyGeometryLine;

const storeGeometryLine = new Map();

export const _defineAssertGeometryLine = (value: AnyGeometryLine) =>
  defineAssertValue(storeGeometryLine, value);

// @ts-expect-error
export const isGeometryLine: IsValue<AnyGeometryLine> = value =>
  isValue(storeGeometryLine, value);

/******************************************************************************
 * GeometryPolygon
 *****************************************************************************/

export type AnyGeometryPolygon =
  | GeometryPolygon
  | FullyGeometryPolygon
  | TinyGeometryPolygon;

const storeGeometryPolygon = new Map();

export const _defineAssertGeometryPolygon = (value: AnyGeometryPolygon) =>
  defineAssertValue(storeGeometryPolygon, value);

// @ts-expect-error
export const isGeometryPolygon: IsValue<AnyGeometryPolygon> = value =>
  isValue(storeGeometryPolygon, value);

/******************************************************************************
 * GeometryMultiPoint
 *****************************************************************************/

export type AnyGeometryMultiPoint =
  | GeometryMultiPoint
  | FullyGeometryMultiPoint
  | TinyGeometryMultiPoint;

const storeGeometryMultiPoint = new Map();

export const _defineAssertGeometryMultiPoint = (
  value: AnyGeometryMultiPoint,
) => defineAssertValue(storeGeometryMultiPoint, value);

// @ts-expect-error
export const isGeometryMultiPoint: IsValue<AnyGeometryMultiPoint> = value =>
  isValue(storeGeometryMultiPoint, value);

/******************************************************************************
 * GeometryMultiLine
 *****************************************************************************/

export type AnyGeometryMultiLine =
  | GeometryMultiLine
  | FullyGeometryMultiLine
  | TinyGeometryMultiLine;

const storeGeometryMultiLine = new Map();

export const _defineAssertGeometryMultiLine = (value: AnyGeometryMultiLine) =>
  defineAssertValue(storeGeometryMultiLine, value);

// @ts-expect-error
export const isGeometryMultiLine: IsValue<AnyGeometryMultiLine> = value =>
  isValue(storeGeometryMultiLine, value);

/******************************************************************************
 * GeometryMultiPolygon
 *****************************************************************************/

export type AnyGeometryMultiPolygon =
  | GeometryMultiPolygon
  | FullyGeometryMultiPolygon
  | TinyGeometryMultiPolygon;

const storeGeometryMultiPolygon = new Map();

export const _defineAssertGeometryMultiPolygon = (
  value: AnyGeometryMultiPolygon,
) => defineAssertValue(storeGeometryMultiPolygon, value);

// @ts-expect-error
export const isGeometryMultiPolygon: IsValue<AnyGeometryMultiPolygon> = value =>
  isValue(storeGeometryMultiPolygon, value);

/******************************************************************************
 * GeometryCollection
 *****************************************************************************/

export type AnyGeometryCollection =
  | GeometryCollection
  | FullyGeometryCollection
  | TinyGeometryCollection;

const storeGeometryCollection = new Map();

export const _defineAssertGeometryCollection = (
  value: AnyGeometryCollection,
) => defineAssertValue(storeGeometryCollection, value);

// @ts-expect-error
export const isGeometryCollection: IsValue<AnyGeometryCollection> = value =>
  isValue(storeGeometryCollection, value);

/******************************************************************************
 * Table
 *****************************************************************************/

/**
 * Escapes ident.
 *
 * @param ident - The ident to escape.
 * @returns The escaped record ID.
 * @see https://github.com/surrealdb/surrealdb/blob/v1.5.0/core/src/sql/escape.rs
 * @see https://github.com/surrealdb/surrealdb.js/blob/v1.0.0-beta.8/src/library/cbor/recordid.ts
 */
export function escapeIdent(ident: string): string {
  let code: number | undefined, char: string;

  for (char of ident) {
    if (
      !(code = char.codePointAt(0))
      || (
        !(code > 47 && code < 58) // numeric (0-9)
        && !(code > 64 && code < 91) // upper alpha (A-Z)
        && !(code > 96 && code < 123) // lower alpha (a-z)
        && !(code == 95) // underscore (_)
      )
    ) {
      return `⟨${ident.replaceAll("⟩", "\⟩")}⟩`;
    }
  }

  return ident;
}

export type AnyTable = Table | FullyTable | TinyTable;

const storeTable = new Map();

export const _defineAssertTable = (value: AnyTable) =>
  defineAssertValue(storeTable, value);

// @ts-expect-error
export const isTable: IsValue<AnyTable> = value => isValue(storeTable, value);

/******************************************************************************
 * Thing
 *****************************************************************************/

export type AnyThing = Thing | FullyThing | TinyThing;

const storeThing = new Map();

export const _defineAssertThing = (value: AnyThing) =>
  defineAssertValue(storeThing, value);

// @ts-expect-error
export const isThing: IsValue<AnyThing> = value => isValue(storeThing, value);

/******************************************************************************
 * Uuid
 *****************************************************************************/

export type AnyUuid = Uuid | FullyUuid | TinyUuid;

const storeUuid = new Map();

export const _defineAssertUuid = (value: AnyUuid) =>
  defineAssertValue(storeUuid, value);

// @ts-expect-error
export const isUuid: IsValue<AnyUuid> = value => isValue(storeUuid, value);

/******************************************************************************
 * Internal
 *****************************************************************************/

type IsValue<T> = {
  /**
   * @deprecated This usage might be incorrect.
   */
  (value: Primitive): value is never;
  /**
   * Check if the value is of the type.
   *
   * @param value The value to check.
   * @returns `true` if the value is of the type, `false` otherwise.
   */
  (value: unknown): value is T;
};

const ASSERT_VALUE = /* @__PURE__ */ Symbol();

function isValue(store: Map<object, object>, value: any): boolean {
  const storeKey = {};
  const storeValue = new SurrealDbError(
    "This function cannot be used in this context.",
  );

  try {
    store.set(storeKey, storeValue);
    value[ASSERT_VALUE](storeKey);
    return false;
  } catch (gotValue) {
    return gotValue === storeValue;
  } finally {
    store.delete(storeKey);
  }
}

function defineAssertValue(
  store: Map<object, object>,
  value: object,
): void {
  Object.defineProperty(value, ASSERT_VALUE, {
    configurable: false,
    enumerable: false,
    get: () => (storeKey: object) => {
      throw store.get(storeKey);
    },
  });
}
