import type {
  Datetime as DecodeOnlyDatetime,
  Decimal as DecodeOnlyDecimal,
  Duration as DecodeOnlyDuration,
  GeometryCollection as DecodeOnlyGeometryCollection,
  GeometryLine as DecodeOnlyGeometryLine,
  GeometryMultiLine as DecodeOnlyGeometryMultiLine,
  GeometryMultiPoint as DecodeOnlyGeometryMultiPoint,
  GeometryMultiPolygon as DecodeOnlyGeometryMultiPolygon,
  GeometryPoint as DecodeOnlyGeometryPoint,
  GeometryPolygon as DecodeOnlyGeometryPolygon,
  Table as DecodeOnlyTable,
  Thing as DecodeOnlyThing,
  Uuid as DecodeOnlyUuid,
  // Future as DecodeOnlyFuture,
  // Range as DecodeOnlyRange,
  // BoundIncluded as DecodeOnlyBoundIncluded,
  // BoundExcluded as DecodeOnlyBoundExcluded,
} from "@tai-kun/surrealdb/data-types/decode-only";
import type {
  Datetime as EncodableDatetime,
  Decimal as EncodableDecimal,
  Duration as EncodableDuration,
  GeometryCollection as EncodableGeometryCollection,
  GeometryLine as EncodableGeometryLine,
  GeometryMultiLine as EncodableGeometryMultiLine,
  GeometryMultiPoint as EncodableGeometryMultiPoint,
  GeometryMultiPolygon as EncodableGeometryMultiPolygon,
  GeometryPoint as EncodableGeometryPoint,
  GeometryPolygon as EncodableGeometryPolygon,
  Table as EncodableTable,
  Thing as EncodableThing,
  Uuid as EncodableUuid,
  // Future as EncodableFuture,
  // Range as EncodableRange,
  // BoundIncluded as EncodableBoundIncluded,
  // BoundExcluded as EncodableBoundExcluded,
} from "@tai-kun/surrealdb/data-types/encodable";
import type {
  Datetime as StandardDatetime,
  Decimal as StandardDecimal,
  Duration as StandardDuration,
  GeometryCollection as StandardGeometryCollection,
  GeometryLine as StandardGeometryLine,
  GeometryMultiLine as StandardGeometryMultiLine,
  GeometryMultiPoint as StandardGeometryMultiPoint,
  GeometryMultiPolygon as StandardGeometryMultiPolygon,
  GeometryPoint as StandardGeometryPoint,
  GeometryPolygon as StandardGeometryPolygon,
  Table as StandardTable,
  Thing as StandardThing,
  Uuid as StandardUuid,
  // Future as StandardFuture,
  // Range as StandardRange,
  // BoundIncluded as StandardBoundIncluded,
  // BoundExcluded as StandardBoundExcluded,
} from "@tai-kun/surrealdb/data-types/standard";

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

  // export type Future =
  //   | DecodeOnlyFuture
  //   | EncodableFuture
  //   | StandardFuture;

  export type Uuid =
    | DecodeOnlyUuid
    | EncodableUuid
    | StandardUuid;

  // export type Range =
  //   | DecodeOnlyRange
  //   | EncodableRange
  //   | StandardRange;

  // export type BoundIncluded =
  //   | DecodeOnlyBoundIncluded
  //   | EncodableBoundIncluded
  //   | StandardBoundIncluded;

  // export type BoundExcluded =
  //   | DecodeOnlyBoundExcluded
  //   | EncodableBoundExcluded
  //   | StandardBoundExcluded;

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
  // | DataType.Future
  | DataType.Uuid
  // | DataType.Range
  // | DataType.BoundIncluded
  // | DataType.BoundExcluded
  | DataType.GeometryPoint
  | DataType.GeometryLine
  | DataType.GeometryPolygon
  | DataType.GeometryMultiPoint
  | DataType.GeometryMultiLine
  | DataType.GeometryMultiPolygon
  | DataType.GeometryCollection;

function isValue(o: unknown, id: string): boolean {
  return !!o
    && typeof o === "object"
    // @ts-expect-error
    && o["$$datatype"] === Symbol.for("@tai-kun/surrealdb/data-types/" + id);
}

export function isTable<T = DataType.Table>(o: unknown): o is T {
  return isValue(o, "table");
}

export function isThing<T = DataType.Thing>(o: unknown): o is T {
  return isValue(o, "thing");
}

export function isDecimal<T = DataType.Decimal>(o: unknown): o is T {
  return isValue(o, "decimal");
}

export function isDatetime<T = DataType.Datetime>(o: unknown): o is T {
  return isValue(o, "datetime");
}

export function isDuration<T = DataType.Duration>(o: unknown): o is T {
  return isValue(o, "duration");
}

// export function isFuture<T = DataType.Future>(o: unknown): o is T {
//   return isValue(o, "future");
// }

export function isUuid<T = DataType.Uuid>(o: unknown): o is T {
  return isValue(o, "uuid");
}

// export function isRange<T = DataType.Range>(o: unknown): o is T {
//   return isValue(o, "range");
// }

// export function isBoundIncluded<T = DataType.BoundIncluded>(
//   o: unknown,
// ): o is T {
//   return isValue(o, "boundincluded");
// }

// export function isBoundExcluded<T = DataType.BoundExcluded>(
//   o: unknown,
// ): o is T {
//   return isValue(o, "boundexcluded");
// }

export function isGeometryPoint<T = DataType.GeometryPoint>(
  o: unknown,
): o is T {
  return isValue(o, "geometrypoint");
}

export function isGeometryLine<T = DataType.GeometryLine>(o: unknown): o is T {
  return isValue(o, "geometryline");
}

export function isGeometryPolygon<T = DataType.GeometryPolygon>(
  o: unknown,
): o is T {
  return isValue(o, "geometrypolygon");
}

export function isGeometryMultiPoint<T = DataType.GeometryMultiPoint>(
  o: unknown,
): o is T {
  return isValue(o, "geometrymultipoint");
}

export function isGeometryMultiLine<T = DataType.GeometryMultiLine>(
  o: unknown,
): o is T {
  return isValue(o, "geometrymultiline");
}

export function isGeometryMultiPolygon<T = DataType.GeometryMultiPolygon>(
  o: unknown,
): o is T {
  return isValue(o, "geometrymultipolygon");
}

export function isGeometryCollection<T = DataType.GeometryCollection>(
  o: unknown,
): o is T {
  return isValue(o, "geometrycollection");
}
