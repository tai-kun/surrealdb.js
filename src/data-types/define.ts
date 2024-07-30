function defineAsValue(o: {}, id: string): void {
  Object.defineProperty(
    o,
    "$$datatype",
    { value: Symbol.for("@tai-kun/surreal/data-types/" + id) },
  );
}

export function defineAsDatetime(o: {}): void {
  defineAsValue(o, "datetime");
}

export function defineAsDecimal(o: {}): void {
  defineAsValue(o, "decimal");
}

export function defineAsDuration(o: {}): void {
  defineAsValue(o, "duration");
}

export function defineAsGeometryCollection(o: {}): void {
  defineAsValue(o, "geometrycollection");
}

export function defineAsGeometryLine(o: {}): void {
  defineAsValue(o, "geometryline");
}

export function defineAsGeometryMultiLine(o: {}): void {
  defineAsValue(o, "geometrymultiline");
}

export function defineAsGeometryMultiPoint(o: {}): void {
  defineAsValue(o, "geometrymultipoint");
}

export function defineAsGeometryMultiPolygon(o: {}): void {
  defineAsValue(o, "geometrymultipolygon");
}

export function defineAsGeometryPoint(o: {}): void {
  defineAsValue(o, "geometrypoint");
}

export function defineAsGeometryPolygon(o: {}): void {
  defineAsValue(o, "geometrypolygon");
}

export function defineAsTable(o: {}): void {
  defineAsValue(o, "table");
}

export function defineAsThing(o: {}): void {
  defineAsValue(o, "thing");
}

export function defineAsUuid(o: {}): void {
  defineAsValue(o, "uuid");
}
