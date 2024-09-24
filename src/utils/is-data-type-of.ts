export function isDataTypeOf<T = any>(o: unknown, id: string): o is T {
  return o !== null
    && typeof o === "object"
    // @ts-expect-error
    && o["$$datatype"] === Symbol.for("@tai-kun/surrealdb/data-types/" + id);
}

export function isTable<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "table");
}

export function isThing<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "thing");
}

export function isDecimal<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "decimal");
}

export function isDatetime<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "datetime");
}

export function isDuration<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "duration");
}

export function isFuture<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "future");
}

export function isUuid<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "uuid");
}

export function isRange<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "range");
}

export function isBoundIncluded<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "boundincluded");
}

export function isBoundExcluded<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "boundexcluded");
}

export function isGeometryPoint<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrypoint");
}

export function isGeometryLine<T = any>(o: unknown): o is T {
  return isDataTypeOf(o, "geometryline");
}

export function isGeometryPolygon<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrypolygon");
}

export function isGeometryMultiPoint<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrymultipoint");
}

export function isGeometryMultiLine<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrymultiline");
}

export function isGeometryMultiPolygon<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrymultipolygon");
}

export function isGeometryCollection<T = any>(
  o: unknown,
): o is T {
  return isDataTypeOf(o, "geometrycollection");
}
