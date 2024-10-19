import type {
  BoundExcluded as DecodeOnlyBoundExcluded,
  BoundIncluded as DecodeOnlyBoundIncluded,
  Datetime as DecodeOnlyDatetime,
  Decimal as DecodeOnlyDecimal,
  Duration as DecodeOnlyDuration,
  Future as DecodeOnlyFuture,
  GeometryCollection as DecodeOnlyGeometryCollection,
  GeometryLine as DecodeOnlyGeometryLine,
  GeometryMultiLine as DecodeOnlyGeometryMultiLine,
  GeometryMultiPoint as DecodeOnlyGeometryMultiPoint,
  GeometryMultiPolygon as DecodeOnlyGeometryMultiPolygon,
  GeometryPoint as DecodeOnlyGeometryPoint,
  GeometryPolygon as DecodeOnlyGeometryPolygon,
  Range as DecodeOnlyRange,
  Table as DecodeOnlyTable,
  Thing as DecodeOnlyThing,
  Uuid as DecodeOnlyUuid,
} from "@tai-kun/surrealdb/decodeonly-datatypes";
import type {
  BoundExcluded as EncodableBoundExcluded,
  BoundIncluded as EncodableBoundIncluded,
  Datetime as EncodableDatetime,
  Decimal as EncodableDecimal,
  Duration as EncodableDuration,
  Future as EncodableFuture,
  GeometryCollection as EncodableGeometryCollection,
  GeometryLine as EncodableGeometryLine,
  GeometryMultiLine as EncodableGeometryMultiLine,
  GeometryMultiPoint as EncodableGeometryMultiPoint,
  GeometryMultiPolygon as EncodableGeometryMultiPolygon,
  GeometryPoint as EncodableGeometryPoint,
  GeometryPolygon as EncodableGeometryPolygon,
  Range as EncodableRange,
  Table as EncodableTable,
  Thing as EncodableThing,
  Uuid as EncodableUuid,
} from "@tai-kun/surrealdb/encodable-datatypes";
import type {
  BoundExcluded as StandardBoundExcluded,
  BoundIncluded as StandardBoundIncluded,
  Datetime as StandardDatetime,
  Decimal as StandardDecimal,
  Duration as StandardDuration,
  Future as StandardFuture,
  GeometryCollection as StandardGeometryCollection,
  GeometryLine as StandardGeometryLine,
  GeometryMultiLine as StandardGeometryMultiLine,
  GeometryMultiPoint as StandardGeometryMultiPoint,
  GeometryMultiPolygon as StandardGeometryMultiPolygon,
  GeometryPoint as StandardGeometryPoint,
  GeometryPolygon as StandardGeometryPolygon,
  Range as StandardRange,
  Table as StandardTable,
  Thing as StandardThing,
  Uuid as StandardUuid,
} from "@tai-kun/surrealdb/standard-datatypes";
import { isDataTypeOf } from "@tai-kun/surrealdb/utils";

export namespace DataType {
  export type Table =
    | DecodeOnlyTable
    | EncodableTable
    | StandardTable;

  export type Thing =
    | DecodeOnlyThing
    | EncodableThing
    | StandardThing;

  export type Decimal =
    | DecodeOnlyDecimal
    | EncodableDecimal
    | StandardDecimal;

  export type Datetime =
    | DecodeOnlyDatetime
    | EncodableDatetime
    | StandardDatetime;

  export type Duration =
    | DecodeOnlyDuration
    | EncodableDuration
    | StandardDuration;

  export type Future =
    | DecodeOnlyFuture
    | EncodableFuture
    | StandardFuture;

  export type Uuid =
    | DecodeOnlyUuid
    | EncodableUuid
    | StandardUuid;

  export type Range =
    | DecodeOnlyRange
    | EncodableRange
    | StandardRange;

  export type BoundIncluded =
    | DecodeOnlyBoundIncluded
    | EncodableBoundIncluded
    | StandardBoundIncluded;

  export type BoundExcluded =
    | DecodeOnlyBoundExcluded
    | EncodableBoundExcluded
    | StandardBoundExcluded;

  export type GeometryPoint =
    | DecodeOnlyGeometryPoint
    | EncodableGeometryPoint
    | StandardGeometryPoint;

  export type GeometryLine =
    | DecodeOnlyGeometryLine
    | EncodableGeometryLine
    | StandardGeometryLine;

  export type GeometryPolygon =
    | DecodeOnlyGeometryPolygon
    | EncodableGeometryPolygon
    | StandardGeometryPolygon;

  export type GeometryMultiPoint =
    | DecodeOnlyGeometryMultiPoint
    | EncodableGeometryMultiPoint
    | StandardGeometryMultiPoint;

  export type GeometryMultiLine =
    | DecodeOnlyGeometryMultiLine
    | EncodableGeometryMultiLine
    | StandardGeometryMultiLine;

  export type GeometryMultiPolygon =
    | DecodeOnlyGeometryMultiPolygon
    | EncodableGeometryMultiPolygon
    | StandardGeometryMultiPolygon;

  export type GeometryCollection =
    | DecodeOnlyGeometryCollection
    | EncodableGeometryCollection
    | StandardGeometryCollection;
}

export type DataType =
  | DataType.Table
  | DataType.Thing
  | DataType.Decimal
  | DataType.Datetime
  | DataType.Duration
  | DataType.Future
  | DataType.Uuid
  | DataType.Range
  | DataType.BoundIncluded
  | DataType.BoundExcluded
  | DataType.GeometryPoint
  | DataType.GeometryLine
  | DataType.GeometryPolygon
  | DataType.GeometryMultiPoint
  | DataType.GeometryMultiLine
  | DataType.GeometryMultiPolygon
  | DataType.GeometryCollection;

export function isTable<T = DataType.Table>(o: unknown): o is T {
  return isDataTypeOf(o, "table");
}

export function isThing<T = DataType.Thing>(o: unknown): o is T {
  return isDataTypeOf(o, "thing");
}

export function isDecimal<T = DataType.Decimal>(o: unknown): o is T {
  return isDataTypeOf(o, "decimal");
}

export function isDatetime<T = DataType.Datetime>(o: unknown): o is T {
  return isDataTypeOf(o, "datetime");
}

export function isDuration<T = DataType.Duration>(o: unknown): o is T {
  return isDataTypeOf(o, "duration");
}

export function isFuture<T = DataType.Future>(o: unknown): o is T {
  return isDataTypeOf(o, "future");
}

export function isUuid<T = DataType.Uuid>(o: unknown): o is T {
  return isDataTypeOf(o, "uuid");
}

export function isRange<T = DataType.Range>(o: unknown): o is T {
  return isDataTypeOf(o, "range");
}

export function isBoundIncluded<T = DataType.BoundIncluded>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "boundincluded");
}

export function isBoundExcluded<T = DataType.BoundExcluded>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "boundexcluded");
}

export function isGeometryPoint<T = DataType.GeometryPoint>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrypoint");
}

export function isGeometryLine<T = DataType.GeometryLine>(o: unknown): o is T {
  return isDataTypeOf(o, "geometryline");
}

export function isGeometryPolygon<T = DataType.GeometryPolygon>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrypolygon");
}

export function isGeometryMultiPoint<T = DataType.GeometryMultiPoint>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrymultipoint");
}

export function isGeometryMultiLine<T = DataType.GeometryMultiLine>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrymultiline");
}

export function isGeometryMultiPolygon<T = DataType.GeometryMultiPolygon>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrymultipolygon");
}

export function isGeometryCollection<T = DataType.GeometryCollection>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrycollection");
}
