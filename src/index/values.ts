import type { Primitive } from "type-fest";
import { SurrealError } from "~/errors";
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
} from "~/values/_lib/internal";
import type {
  Datetime as DecodeOnlyDatetime,
  Decimal as DecodeOnlyDecimal,
  Duration as DecodeOnlyDuration,
  GeometryCollectionBase as DecodeOnlyGeometryCollectionBase,
  GeometryLineBase as DecodeOnlyGeometryLineBase,
  GeometryMultiLineBase as DecodeOnlyGeometryMultiLineBase,
  GeometryMultiPointBase as DecodeOnlyGeometryMultiPointBase,
  GeometryMultiPolygonBase as DecodeOnlyGeometryMultiPolygonBase,
  GeometryPointBase as DecodeOnlyGeometryPointBase,
  GeometryPolygonBase as DecodeOnlyGeometryPolygonBase,
  Table as DecodeOnlyTable,
  Thing as DecodeOnlyThing,
  Uuid as DecodeOnlyUuid,
} from "~/values/decode-only";
import type {
  Datetime as EncodableDatetime,
  Decimal as EncodableDecimal,
  Duration as EncodableDuration,
  GeometryCollectionBase as EncodableGeometryCollectionBase,
  GeometryLineBase as EncodableGeometryLineBase,
  GeometryMultiLineBase as EncodableGeometryMultiLineBase,
  GeometryMultiPointBase as EncodableGeometryMultiPointBase,
  GeometryMultiPolygonBase as EncodableGeometryMultiPolygonBase,
  GeometryPointBase as EncodableGeometryPointBase,
  GeometryPolygonBase as EncodableGeometryPolygonBase,
  Table as EncodableTable,
  Thing as EncodableThing,
  Uuid as EncodableUuid,
} from "~/values/encodable";
import type {
  Datetime as FullDatetime,
  Decimal as FullDecimal,
  Duration as FullDuration,
  GeometryCollectionBase as FullGeometryCollectionBase,
  GeometryLineBase as FullGeometryLineBase,
  GeometryMultiLineBase as FullGeometryMultiLineBase,
  GeometryMultiPointBase as FullGeometryMultiPointBase,
  GeometryMultiPolygonBase as FullGeometryMultiPolygonBase,
  GeometryPointBase as FullGeometryPointBase,
  GeometryPolygonBase as FullGeometryPolygonBase,
  Table as FullTable,
  Thing as FullThing,
  Uuid as FullUuid,
} from "~/values/full";
import type {
  Datetime as StandardDatetime,
  Decimal as StandardDecimal,
  Duration as StandardDuration,
  GeometryCollectionBase as StandardGeometryCollectionBase,
  GeometryLineBase as StandardGeometryLineBase,
  GeometryMultiLineBase as StandardGeometryMultiLineBase,
  GeometryMultiPointBase as StandardGeometryMultiPointBase,
  GeometryMultiPolygonBase as StandardGeometryMultiPolygonBase,
  GeometryPointBase as StandardGeometryPointBase,
  GeometryPolygonBase as StandardGeometryPolygonBase,
  Table as StandardTable,
  Thing as StandardThing,
  Uuid as StandardUuid,
} from "~/values/standard";

type IsValue<T> = {
  /**
   * この使い方は間違っています。
   */
  (value: Primitive): value is never;
  /**
   * 値が指定された型であるかどうかを確認します。
   *
   * @param value 確認する値。
   * @returns 値が指定された型である場合は `true`、そうでない場合は `false`。
   */
  (value: unknown): value is T;
};

function isValue(errors: Map<object, object>, value: any): boolean {
  const errorKey = {};
  const error = new SurrealError(
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

export type Datetime =
  | DecodeOnlyDatetime
  | EncodableDatetime
  | StandardDatetime
  | FullDatetime;

// @ts-expect-error
export const isDatetime: IsValue<Datetime> = value =>
  isValue(datetimeErrors, value);

/******************************************************************************
 * Decimal
 *****************************************************************************/

export type Decimal =
  | DecodeOnlyDecimal
  | EncodableDecimal
  | StandardDecimal
  | FullDecimal;

// @ts-expect-error
export const isDecimal: IsValue<Decimal> = value =>
  isValue(decimalErrors, value);

/******************************************************************************
 * Duration
 *****************************************************************************/

export type Duration =
  | DecodeOnlyDuration
  | EncodableDuration
  | StandardDuration
  | FullDuration;

// @ts-expect-error
export const isDuration: IsValue<Duration> = value =>
  isValue(durationErrors, value);

/******************************************************************************
 * GeometryPoint
 *****************************************************************************/

type Coord = ((arg: any) => unknown) | (new(arg: any) => unknown);
type DecodeOnlyGeometryPoint = DecodeOnlyGeometryPointBase<Coord>;
type EncodableGeometryPoint = EncodableGeometryPointBase<Coord>;
type StandardGeometryPoint = StandardGeometryPointBase<Coord>;
type FullGeometryPoint = FullGeometryPointBase<Coord>;

export type GeometryPoint =
  | DecodeOnlyGeometryPoint
  | EncodableGeometryPoint
  | StandardGeometryPoint
  | FullGeometryPoint;

// @ts-expect-error
export const isGeometryPoint: IsValue<GeometryPoint> = value =>
  isValue(geometryPointErrors, value);

/******************************************************************************
 * GeometryLine
 *****************************************************************************/

type DecodeOnlyGeometryLine = DecodeOnlyGeometryLineBase<
  new(_: any) => DecodeOnlyGeometryPoint
>;
type EncodableGeometryLine = EncodableGeometryLineBase<
  new(_: any) => EncodableGeometryPoint
>;
type StandardGeometryLine = StandardGeometryLineBase<
  new(_: any) => StandardGeometryPoint
>;
type FullGeometryLine = FullGeometryLineBase<
  new(_: any) => FullGeometryPoint
>;

export type GeometryLine =
  | DecodeOnlyGeometryLine
  | EncodableGeometryLine
  | StandardGeometryLine
  | FullGeometryLine;

// @ts-expect-error
export const isGeometryLine: IsValue<GeometryLine> = value =>
  isValue(geometryLineErrors, value);

/******************************************************************************
 * GeometryPolygon
 *****************************************************************************/

type DecodeOnlyGeometryPolygon = DecodeOnlyGeometryPolygonBase<
  new(_: any) => DecodeOnlyGeometryLine
>;
type EncodableGeometryPolygon = EncodableGeometryPolygonBase<
  new(_: any) => EncodableGeometryLine
>;
type StandardGeometryPolygon = StandardGeometryPolygonBase<
  new(_: any) => StandardGeometryLine
>;
type FullGeometryPolygon = FullGeometryPolygonBase<
  new(_: any) => FullGeometryLine
>;

export type GeometryPolygon =
  | DecodeOnlyGeometryPolygon
  | EncodableGeometryPolygon
  | StandardGeometryPolygon
  | FullGeometryPolygon;

// @ts-expect-error
export const isGeometryPolygon: IsValue<GeometryPolygon> = value =>
  isValue(geometryPolygonErrors, value);

/******************************************************************************
 * GeometryMultiPoint
 *****************************************************************************/

type DecodeOnlyGeometryMultiPoint = DecodeOnlyGeometryMultiPointBase<
  new(_: any) => DecodeOnlyGeometryPoint
>;
type EncodableGeometryMultiPoint = EncodableGeometryMultiPointBase<
  new(_: any) => EncodableGeometryPoint
>;
type StandardGeometryMultiPoint = StandardGeometryMultiPointBase<
  new(_: any) => StandardGeometryPoint
>;
type FullGeometryMultiPoint = FullGeometryMultiPointBase<
  new(_: any) => FullGeometryPoint
>;

export type GeometryMultiPoint =
  | DecodeOnlyGeometryMultiPoint
  | EncodableGeometryMultiPoint
  | StandardGeometryMultiPoint
  | FullGeometryMultiPoint;

// @ts-expect-error
export const isGeometryMultiPoint: IsValue<GeometryMultiPoint> = value =>
  isValue(geometryMultiPointErrors, value);

/******************************************************************************
 * GeometryMultiLine
 *****************************************************************************/

type DecodeOnlyGeometryMultiLine = DecodeOnlyGeometryMultiLineBase<
  new(_: any) => DecodeOnlyGeometryLine
>;
type EncodableGeometryMultiLine = EncodableGeometryMultiLineBase<
  new(_: any) => EncodableGeometryLine
>;
type StandardGeometryMultiLine = StandardGeometryMultiLineBase<
  new(_: any) => StandardGeometryLine
>;
type FullGeometryMultiLine = FullGeometryMultiLineBase<
  new(_: any) => FullGeometryLine
>;

export type GeometryMultiLine =
  | DecodeOnlyGeometryMultiLine
  | EncodableGeometryMultiLine
  | StandardGeometryMultiLine
  | FullGeometryMultiLine;

// @ts-expect-error
export const isGeometryMultiLine: IsValue<GeometryMultiLine> = value =>
  isValue(geometryMultiLineErrors, value);

/******************************************************************************
 * GeometryMultiPolygon
 *****************************************************************************/

type DecodeOnlyGeometryMultiPolygon = DecodeOnlyGeometryMultiPolygonBase<
  new(_: any) => DecodeOnlyGeometryPolygon
>;
type EncodableGeometryMultiPolygon = EncodableGeometryMultiPolygonBase<
  new(_: any) => EncodableGeometryPolygon
>;
type StandardGeometryMultiPolygon = StandardGeometryMultiPolygonBase<
  new(_: any) => StandardGeometryPolygon
>;
type FullGeometryMultiPolygon = FullGeometryMultiPolygonBase<
  new(_: any) => FullGeometryPolygon
>;

export type GeometryMultiPolygon =
  | DecodeOnlyGeometryMultiPolygon
  | EncodableGeometryMultiPolygon
  | StandardGeometryMultiPolygon
  | FullGeometryMultiPolygon;

// @ts-expect-error
export const isGeometryMultiPolygon: IsValue<GeometryMultiPolygon> = value =>
  isValue(geometryMultiPolygonErrors, value);

/******************************************************************************
 * GeometryCollection
 *****************************************************************************/

type DecodeOnlyGeometryCollection = DecodeOnlyGeometryCollectionBase<
  new(_: any) => DecodeOnlyGeometryPoint,
  new(_: any) => DecodeOnlyGeometryMultiPoint,
  new(_: any) => DecodeOnlyGeometryLine,
  new(_: any) => DecodeOnlyGeometryMultiLine,
  new(_: any) => DecodeOnlyGeometryPolygon,
  new(_: any) => DecodeOnlyGeometryMultiPolygon
>;
type EncodableGeometryCollection = EncodableGeometryCollectionBase<
  new(_: any) => EncodableGeometryPoint,
  new(_: any) => EncodableGeometryMultiPoint,
  new(_: any) => EncodableGeometryLine,
  new(_: any) => EncodableGeometryMultiLine,
  new(_: any) => EncodableGeometryPolygon,
  new(_: any) => EncodableGeometryMultiPolygon
>;
type StandardGeometryCollection = StandardGeometryCollectionBase<
  new(_: any) => StandardGeometryPoint,
  new(_: any) => StandardGeometryMultiPoint,
  new(_: any) => StandardGeometryLine,
  new(_: any) => StandardGeometryMultiLine,
  new(_: any) => StandardGeometryPolygon,
  new(_: any) => StandardGeometryMultiPolygon
>;
type FullGeometryCollection = FullGeometryCollectionBase<
  new(_: any) => FullGeometryPoint,
  new(_: any) => FullGeometryMultiPoint,
  new(_: any) => FullGeometryLine,
  new(_: any) => FullGeometryMultiLine,
  new(_: any) => FullGeometryPolygon,
  new(_: any) => FullGeometryMultiPolygon
>;

export type GeometryCollection =
  | DecodeOnlyGeometryCollection
  | EncodableGeometryCollection
  | StandardGeometryCollection
  | FullGeometryCollection;

// @ts-expect-error
export const isGeometryCollection: IsValue<GeometryCollection> = value =>
  isValue(geometryCollectionErrors, value);

/******************************************************************************
 * Table
 *****************************************************************************/

export type Table =
  | DecodeOnlyTable
  | EncodableTable
  | StandardTable
  | FullTable;

// @ts-expect-error
export const isTable: IsValue<Table> = value => isValue(tableErrors, value);

/******************************************************************************
 * Thing
 *****************************************************************************/

export type Thing =
  | DecodeOnlyThing
  | EncodableThing
  | StandardThing
  | FullThing;

// @ts-expect-error
export const isThing: IsValue<Thing> = value => isValue(thingErrors, value);

/******************************************************************************
 * Uuid
 *****************************************************************************/

export type Uuid =
  | DecodeOnlyUuid
  | EncodableUuid
  | StandardUuid
  | FullUuid;

// @ts-expect-error
export const isUuid: IsValue<Uuid> = value => isValue(uuidErrors, value);
