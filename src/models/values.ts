import type { Primitive } from "type-fest";
import { SurrealDbError } from "../errors";
import type {
  Datetime as DatetimeFull,
  Decimal as DecimalFull,
  Duration as DurationFull,
  GeometryCollection as GeometryCollectionFull,
  GeometryLine as GeometryLineFull,
  GeometryMultiLine as GeometryMultiLineFull,
  GeometryMultiPoint as GeometryMultiPointFull,
  GeometryMultiPolygon as GeometryMultiPolygonFull,
  GeometryPoint as GeometryPointFull,
  GeometryPolygon as GeometryPolygonFull,
  Table as TableFull,
  Thing as ThingFull,
  Uuid as UuidFull,
} from "./full";
import {
  ASSERT_VALUE,
  datetimeErrors,
  decimalErrors,
  durationErrors,
  geometryCollectionErrors,
  geometryLineErrors,
  geometryMultiLineErrors,
  geometryMultiPointErrors,
  geometryMultiPolygonErrors,
  geometryPointErrors,
  geometryPolygonErrors,
  tableErrors,
  thingErrors,
  uuidErrors,
} from "./internal";
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
} from "./standard";
import type {
  Datetime as DatetimeTiny,
  Decimal as DecimalTiny,
  Duration as DurationTiny,
  GeometryCollection as GeometryCollectionTiny,
  GeometryLine as GeometryLineTiny,
  GeometryMultiLine as GeometryMultiLineTiny,
  GeometryMultiPoint as GeometryMultiPointTiny,
  GeometryMultiPolygon as GeometryMultiPolygonTiny,
  GeometryPoint as GeometryPointTiny,
  GeometryPolygon as GeometryPolygonTiny,
  Table as TableTiny,
  Thing as ThingTiny,
  Uuid as UuidTiny,
} from "./tiny";

type IsValue<T> = {
  /**
   * @deprecated 恐らくこの使い方は間違っています。
   */
  (value: Primitive): value is never;
  /**
   * 値が指定された型であるかどうかを確認します。
   *
   * @param value - 確認する値。
   * @returns 値が指定された型である場合は `true`、そうでない場合は `false`。
   */
  (value: unknown): value is T;
};

function isValue(errors: Map<object, object>, value: any): boolean {
  const errorKey = {};
  const error = new SurrealDbError(
    "This function cannot be used in this context.",
  );

  try {
    errors.set(errorKey, error);
    value[ASSERT_VALUE](errorKey);
    return false;
  } catch (gotError) {
    return Object.is(gotError, error);
  } finally {
    errors.delete(errorKey);
  }
}

/******************************************************************************
 * Datetime
 *****************************************************************************/

export type DatetimeAny = Datetime | DatetimeFull | DatetimeTiny;

// @ts-expect-error
export const isDatetime: IsValue<DatetimeAny> = value =>
  isValue(datetimeErrors, value);

/******************************************************************************
 * Decimal
 *****************************************************************************/

export type DecimalAny = Decimal | DecimalFull | DecimalTiny;

// @ts-expect-error
export const isDecimal: IsValue<DecimalAny> = value =>
  isValue(decimalErrors, value);

/******************************************************************************
 * Duration
 *****************************************************************************/

export type DurationAny = Duration | DurationFull | DurationTiny;

// @ts-expect-error
export const isDuration: IsValue<DurationAny> = value =>
  isValue(durationErrors, value);

/******************************************************************************
 * GeometryPoint
 *****************************************************************************/

export type GeometryPointAny =
  | GeometryPoint
  | GeometryPointFull
  | GeometryPointTiny;

// @ts-expect-error
export const isGeometryPoint: IsValue<GeometryPointAny> = value =>
  isValue(geometryPointErrors, value);

/******************************************************************************
 * GeometryLine
 *****************************************************************************/

export type GeometryLineAny =
  | GeometryLine
  | GeometryLineFull
  | GeometryLineTiny;

// @ts-expect-error
export const isGeometryLine: IsValue<GeometryLineAny> = value =>
  isValue(geometryLineErrors, value);

/******************************************************************************
 * GeometryPolygon
 *****************************************************************************/

export type GeometryPolygonAny =
  | GeometryPolygon
  | GeometryPolygonFull
  | GeometryPolygonTiny;

// @ts-expect-error
export const isGeometryPolygon: IsValue<GeometryPolygonAny> = value =>
  isValue(geometryPolygonErrors, value);

/******************************************************************************
 * GeometryMultiPoint
 *****************************************************************************/

export type GeometryMultiPointAny =
  | GeometryMultiPoint
  | GeometryMultiPointFull
  | GeometryMultiPointTiny;

// @ts-expect-error
export const isGeometryMultiPoint: IsValue<GeometryMultiPointAny> = value =>
  isValue(geometryMultiPointErrors, value);

/******************************************************************************
 * GeometryMultiLine
 *****************************************************************************/

export type GeometryMultiLineAny =
  | GeometryMultiLine
  | GeometryMultiLineFull
  | GeometryMultiLineTiny;

// @ts-expect-error
export const isGeometryMultiLine: IsValue<GeometryMultiLineAny> = value =>
  isValue(geometryMultiLineErrors, value);

/******************************************************************************
 * GeometryMultiPolygon
 *****************************************************************************/

export type GeometryMultiPolygonAny =
  | GeometryMultiPolygon
  | GeometryMultiPolygonFull
  | GeometryMultiPolygonTiny;

// @ts-expect-error
export const isGeometryMultiPolygon: IsValue<GeometryMultiPolygonAny> = value =>
  isValue(geometryMultiPolygonErrors, value);

/******************************************************************************
 * GeometryCollection
 *****************************************************************************/

export type GeometryCollectionAny =
  | GeometryCollection
  | GeometryCollectionFull
  | GeometryCollectionTiny;

// @ts-expect-error
export const isGeometryCollection: IsValue<GeometryCollectionAny> = value =>
  isValue(geometryCollectionErrors, value);

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

export type TableAny = Table | TableFull | TableTiny;

// @ts-expect-error
export const isTable: IsValue<TableAny> = value => isValue(tableErrors, value);

/******************************************************************************
 * Thing
 *****************************************************************************/

export type ThingAny = Thing | ThingFull | ThingTiny;

// @ts-expect-error
export const isThing: IsValue<ThingAny> = value => isValue(thingErrors, value);

/******************************************************************************
 * Uuid
 *****************************************************************************/

export type UuidAny = Uuid | UuidFull | UuidTiny;

// @ts-expect-error
export const isUuid: IsValue<UuidAny> = value => isValue(uuidErrors, value);
