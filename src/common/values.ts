import type { Primitive } from "type-fest";
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
} from "~/models/_values/internal";
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
} from "~/models/full";
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
} from "~/models/standard";
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
} from "~/models/tiny";
import { SurrealDbError } from "./errors";

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

export type DatetimeType = Datetime | DatetimeFull | DatetimeTiny;

// @ts-expect-error
export const isDatetime: IsValue<DatetimeType> = value =>
  isValue(datetimeErrors, value);

/******************************************************************************
 * Decimal
 *****************************************************************************/

export type DecimalType = Decimal | DecimalFull | DecimalTiny;

// @ts-expect-error
export const isDecimal: IsValue<DecimalType> = value =>
  isValue(decimalErrors, value);

/******************************************************************************
 * Duration
 *****************************************************************************/

export type DurationType = Duration | DurationFull | DurationTiny;

// @ts-expect-error
export const isDuration: IsValue<DurationType> = value =>
  isValue(durationErrors, value);

/******************************************************************************
 * GeometryPoint
 *****************************************************************************/

export type GeometryPointType =
  | GeometryPoint
  | GeometryPointFull
  | GeometryPointTiny;

// @ts-expect-error
export const isGeometryPoint: IsValue<GeometryPointType> = value =>
  isValue(geometryPointErrors, value);

/******************************************************************************
 * GeometryLine
 *****************************************************************************/

export type GeometryLineType =
  | GeometryLine
  | GeometryLineFull
  | GeometryLineTiny;

// @ts-expect-error
export const isGeometryLine: IsValue<GeometryLineType> = value =>
  isValue(geometryLineErrors, value);

/******************************************************************************
 * GeometryPolygon
 *****************************************************************************/

export type GeometryPolygonType =
  | GeometryPolygon
  | GeometryPolygonFull
  | GeometryPolygonTiny;

// @ts-expect-error
export const isGeometryPolygon: IsValue<GeometryPolygonType> = value =>
  isValue(geometryPolygonErrors, value);

/******************************************************************************
 * GeometryMultiPoint
 *****************************************************************************/

export type GeometryMultiPointType =
  | GeometryMultiPoint
  | GeometryMultiPointFull
  | GeometryMultiPointTiny;

// @ts-expect-error
export const isGeometryMultiPoint: IsValue<GeometryMultiPointType> = value =>
  isValue(geometryMultiPointErrors, value);

/******************************************************************************
 * GeometryMultiLine
 *****************************************************************************/

export type GeometryMultiLineType =
  | GeometryMultiLine
  | GeometryMultiLineFull
  | GeometryMultiLineTiny;

// @ts-expect-error
export const isGeometryMultiLine: IsValue<GeometryMultiLineType> = value =>
  isValue(geometryMultiLineErrors, value);

/******************************************************************************
 * GeometryMultiPolygon
 *****************************************************************************/

export type GeometryMultiPolygonType =
  | GeometryMultiPolygon
  | GeometryMultiPolygonFull
  | GeometryMultiPolygonTiny;

// @ts-expect-error
export const isGeometryMultiPolygon: IsValue<GeometryMultiPolygonType> =
  value => isValue(geometryMultiPolygonErrors, value);

/******************************************************************************
 * GeometryCollection
 *****************************************************************************/

export type GeometryCollectionType =
  | GeometryCollection
  | GeometryCollectionFull
  | GeometryCollectionTiny;

// @ts-expect-error
export const isGeometryCollection: IsValue<GeometryCollectionType> = value =>
  isValue(geometryCollectionErrors, value);

/******************************************************************************
 * Table
 *****************************************************************************/

export type TableType = Table | TableFull | TableTiny;

// @ts-expect-error
export const isTable: IsValue<TableType> = value => isValue(tableErrors, value);

/******************************************************************************
 * Thing
 *****************************************************************************/

export type ThingType = Thing | ThingFull | ThingTiny;

// @ts-expect-error
export const isThing: IsValue<ThingType> = value => isValue(thingErrors, value);

/******************************************************************************
 * Uuid
 *****************************************************************************/

export type UuidType = Uuid | UuidFull | UuidTiny;

// @ts-expect-error
export const isUuid: IsValue<UuidType> = value => isValue(uuidErrors, value);
