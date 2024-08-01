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
} from "@tai-kun/surrealdb/data-types/standard";

export namespace DataType {
  export type Datetime =
    | DecodeOnlyDatetime
    | EncodableDatetime
    | StandardDatetime;

  export type Decimal =
    | DecodeOnlyDecimal
    | EncodableDecimal
    | StandardDecimal;

  export type Duration =
    | DecodeOnlyDuration
    | EncodableDuration
    | StandardDuration;

  export type Table =
    | DecodeOnlyTable
    | EncodableTable
    | StandardTable;

  export type Thing =
    | DecodeOnlyThing
    | EncodableThing
    | StandardThing;

  export type Uuid =
    | DecodeOnlyUuid
    | EncodableUuid
    | StandardUuid;

  export type GeometryCollection =
    | DecodeOnlyGeometryCollection
    | EncodableGeometryCollection
    | StandardGeometryCollection;

  export type GeometryLine =
    | DecodeOnlyGeometryLine
    | EncodableGeometryLine
    | StandardGeometryLine;

  export type GeometryMultiLine =
    | DecodeOnlyGeometryMultiLine
    | EncodableGeometryMultiLine
    | StandardGeometryMultiLine;

  export type GeometryMultiPoint =
    | DecodeOnlyGeometryMultiPoint
    | EncodableGeometryMultiPoint
    | StandardGeometryMultiPoint;

  export type GeometryMultiPolygon =
    | DecodeOnlyGeometryMultiPolygon
    | EncodableGeometryMultiPolygon
    | StandardGeometryMultiPolygon;

  export type GeometryPoint =
    | DecodeOnlyGeometryPoint
    | EncodableGeometryPoint
    | StandardGeometryPoint;

  export type GeometryPolygon =
    | DecodeOnlyGeometryPolygon
    | EncodableGeometryPolygon
    | StandardGeometryPolygon;
}

export type DataType =
  | DataType.Datetime
  | DataType.Decimal
  | DataType.Duration
  | DataType.Table
  | DataType.Thing
  | DataType.Uuid
  | DataType.GeometryCollection
  | DataType.GeometryLine
  | DataType.GeometryMultiLine
  | DataType.GeometryMultiPoint
  | DataType.GeometryMultiPolygon
  | DataType.GeometryPoint
  | DataType.GeometryPolygon;

function isValue(o: unknown, id: string): boolean {
  return !!o
    && typeof o === "object"
    // @ts-expect-error
    && o["$$datatype"] === Symbol.for("@tai-kun/surrealdb/data-types/" + id);
}

export function isDatetime<T = DataType.Datetime>(
  o: unknown,
): o is T {
  return isValue(o, "datetime");
}

export function isDecimal<T = DataType.Decimal>(
  o: unknown,
): o is T {
  return isValue(o, "decimal");
}

export function isDuration<T = DataType.Duration>(
  o: unknown,
): o is T {
  return isValue(o, "duration");
}

export function isTable<T = DataType.Table>(
  o: unknown,
): o is T {
  return isValue(o, "table");
}

export function isThing<T = DataType.Thing>(
  o: unknown,
): o is T {
  return isValue(o, "thing");
}

export function isUuid<T = DataType.Uuid>(
  o: unknown,
): o is T {
  return isValue(o, "uuid");
}

export function isGeometryCollection<T = DataType.GeometryCollection>(
  o: unknown,
): o is T {
  return isValue(o, "geometrycollection");
}

export function isGeometryLine<T = DataType.GeometryLine>(
  o: unknown,
): o is T {
  return isValue(o, "geometryline");
}

export function isGeometryMultiLine<T = DataType.GeometryMultiLine>(
  o: unknown,
): o is T {
  return isValue(o, "geometrymultiline");
}

export function isGeometryMultiPoint<T = DataType.GeometryMultiPoint>(
  o: unknown,
): o is T {
  return isValue(o, "geometrymultipoint");
}

export function isGeometryMultiPolygon<T = DataType.GeometryMultiPolygon>(
  o: unknown,
): o is T {
  return isValue(o, "geometrymultipolygon");
}

export function isGeometryPoint<T = DataType.GeometryPoint>(
  o: unknown,
): o is T {
  return isValue(o, "geometrypoint");
}

export function isGeometryPolygon<T = DataType.GeometryPolygon>(
  o: unknown,
): o is T {
  return isValue(o, "geometrypolygon");
}

export function dataTypeOf(o: unknown):
  | "datetime"
  | "decimal"
  | "duration"
  | "table"
  | "thing"
  | "uuid"
  | "geometrycollection"
  | "geometryline"
  | "geometrymultiline"
  | "geometrymultipoint"
  | "geometrymultipolygon"
  | "geometrypoint"
  | "geometrypolygon"
  | "unknown"
{
  switch (true) {
    case isDatetime(o):
      return "datetime";

    case isDecimal(o):
      return "decimal";

    case isDuration(o):
      return "duration";

    case isTable(o):
      return "table";

    case isThing(o):
      return "thing";

    case isUuid(o):
      return "uuid";

    case isGeometryCollection(o):
      return "geometrycollection";

    case isGeometryLine(o):
      return "geometryline";

    case isGeometryMultiLine(o):
      return "geometrymultiline";

    case isGeometryMultiPoint(o):
      return "geometrymultipoint";

    case isGeometryMultiPolygon(o):
      return "geometrymultipolygon";

    case isGeometryPoint(o):
      return "geometrypoint";

    case isGeometryPolygon(o):
      return "geometrypolygon";

    default:
      return "unknown";
  }
}
