function defineAsValue(o: object, id: string): void {
  Object.defineProperty(
    o,
    "$$datatype",
    { value: Symbol.for("@tai-kun/surrealdb/data-types/" + id) },
  );
}

export function defineAsTable(o: object): void {
  defineAsValue(o, "table");
}

export function defineAsThing(o: object): void {
  defineAsValue(o, "thing");
}

export function defineAsDecimal(o: object): void {
  defineAsValue(o, "decimal");
}

export function defineAsDatetime(o: object): void {
  defineAsValue(o, "datetime");
}

export function defineAsDuration(o: object): void {
  defineAsValue(o, "duration");
}

export function defineAsFuture(o: object): void {
  defineAsValue(o, "future");
}

export function defineAsUuid(o: object): void {
  defineAsValue(o, "uuid");
}

// export function defineAsRange(o: object): void {
//   defineAsValue(o, "range");
// }

// export function defineAsBoundIncluded(o: object): void {
//   defineAsValue(o, "boundincluded");
// }

// export function defineAsBoundExcluded(o: object): void {
//   defineAsValue(o, "boundexcluded");
// }

export function defineAsGeometryPoint(o: object): void {
  defineAsValue(o, "geometrypoint");
}

export function defineAsGeometryLine(o: object): void {
  defineAsValue(o, "geometryline");
}

export function defineAsGeometryPolygon(o: object): void {
  defineAsValue(o, "geometrypolygon");
}

export function defineAsGeometryMultiPoint(o: object): void {
  defineAsValue(o, "geometrymultipoint");
}

export function defineAsGeometryMultiLine(o: object): void {
  defineAsValue(o, "geometrymultiline");
}

export function defineAsGeometryMultiPolygon(o: object): void {
  defineAsValue(o, "geometrymultipolygon");
}

export function defineAsGeometryCollection(o: object): void {
  defineAsValue(o, "geometrycollection");
}
