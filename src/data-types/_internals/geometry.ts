// dprint-ignore
export type Coord =
  | typeof Number
  | typeof String
  | (new(arg: any) => any);
// | (   (arg: any) => any)
// | (new(arg: any) => any);

// dprint-ignore
export type CoordArg<T extends Coord>
  // 関数は返す値を引数で受け入れることができるようにしなければならない。
  = T extends typeof Number | typeof String ? Parameters<T>[0]
  : T extends new(arg: infer A) => any ? A
  : never;
// export type CoordArg<T extends Coord>
//   // 関数は返す値を引数で受け入れることができるようにしなければならない。
//   = T extends    (arg: infer A) => infer B ? (B extends A ? A : never)
//   : T extends new(arg: infer A) =>     any ? A
//   : never;

// dprint-ignore
export type CoordValue<T extends Coord>
  // 関数は返す値を引数で受け入れることができるようにしなければならない。
  = T extends typeof Number | typeof String ? ReturnType<T>
  : T extends new(arg: any) => infer B ? B
  : never;
// export type CoordValue<T extends Coord>
//   // 関数は返す値を引数で受け入れることができるようにしなければならない。
//   = T extends    (arg: infer A) => infer B ? (B extends A ? B : never)
//   : T extends new(arg:     any) => infer B ? B
//   : never;

type GeoJsonType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon"
  | "GeometryCollection";

export interface Geometry {
  readonly type: GeoJsonType;
}

// export interface GeoJson extends Geometry {
//   readonly type: GeoJsonType;
//   readonly coordinates: readonly unknown[];
// }

export function coord<T extends Coord>(
  Coord: T,
  argOrValue: CoordArg<T> | CoordValue<T>,
): CoordValue<T> {
  return Coord === Number || Coord === String
    // @ts-expect-error
    ? Coord(argOrValue)
    // @ts-expect-error
    : argOrValue instanceof Coord
    ? argOrValue
    : new Coord(argOrValue);
}

export function map<T extends readonly unknown[], U>(
  list: T,
  func: (item: T[number]) => U,
): { -readonly [K in keyof T]: U } {
  let i = 0,
    len = list.length,
    acc = Array.from({ length: len }) as { -readonly [K in keyof T]: U };

  for (; i < len; i++) {
    acc[i] = func(list[i]);
  }

  return acc;
}

function isValue(o: unknown, id: string): boolean {
  return !!o
    && typeof o === "object"
    // @ts-expect-error
    && o["$$datatype"] === Symbol.for("@tai-kun/surrealdb/data-types/" + id);
}

/** @internal */
export function isGeometryCollection<T = any>(o: unknown): o is T {
  return isValue(o, "geometrycollection");
}

/** @internal */
export function isGeometryLine<T = any>(o: unknown): o is T {
  return isValue(o, "geometryline");
}

/** @internal */
export function isGeometryMultiLine<T = any>(o: unknown): o is T {
  return isValue(o, "geometrymultiline");
}

/** @internal */
export function isGeometryMultiPoint<T = any>(o: unknown): o is T {
  return isValue(o, "geometrymultipoint");
}

/** @internal */
export function isGeometryMultiPolygon<T = any>(o: unknown): o is T {
  return isValue(o, "geometrymultipolygon");
}

/** @internal */
export function isGeometryPoint<T = any>(o: unknown): o is T {
  return isValue(o, "geometrypoint");
}

/** @internal */
export function isGeometryPolygon<T = any>(o: unknown): o is T {
  return isValue(o, "geometrypolygon");
}
