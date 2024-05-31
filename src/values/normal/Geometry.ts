import { Geometry, map } from "../tiny/Geometry";
import {
  _defineAssertGeometryCollection,
  _defineAssertGeometryLine,
  _defineAssertGeometryMultiLine,
  _defineAssertGeometryMultiPoint,
  _defineAssertGeometryMultiPolygon,
  _defineAssertGeometryPoint,
  _defineAssertGeometryPolygon,
} from "../utils";
import { Decimal } from "./Decimal";

/**
 * A class representing a point geometry.
 */
export class GeometryPoint extends Geometry<"Point", [x: Decimal, y: Decimal]> {
  /**
   * The point coordinates.
   */
  point: [x: Decimal, y: Decimal];

  get coordinates() {
    return this.point;
  }

  /**
   * @param point - The point coordinates or another point geometry.
   */
  constructor(
    point:
      | readonly [x: number | Decimal, y: number | Decimal]
      | GeometryPoint,
  ) {
    super("Point");
    _defineAssertGeometryPoint(this);
    this.point = map(
      point instanceof GeometryPoint ? point.point : point,
      coord => new Decimal(coord),
    );
  }

  get x(): Decimal {
    return this.point[0];
  }

  set x(value: number | Decimal) {
    this.point[0] = new Decimal(value);
  }

  get y(): Decimal {
    return this.point[1];
  }

  set y(value: number | Decimal) {
    this.point[1] = new Decimal(value);
  }
}

/**
 * A class representing a line geometry.
 */
export class GeometryLine
  extends Geometry<"LineString", GeometryPoint["coordinates"][]>
{
  /**
   * The line points.
   */
  points: GeometryPoint[];

  get coordinates() {
    return map(this.points, g => g.coordinates);
  }

  /**
   * @param line - The line points or another line geometry.
   */
  constructor(line: readonly GeometryPoint[] | GeometryLine) {
    super("LineString");
    _defineAssertGeometryLine(this);
    this.points = map(
      line instanceof GeometryLine ? line.points : line,
      point => new GeometryPoint(point),
    );
  }
}

/**
 * A class representing a polygon geometry.
 */
export class GeometryPolygon extends Geometry<
  "Polygon",
  [
    exteriorRing: GeometryLine["coordinates"],
    ...interiorRings: GeometryLine["coordinates"][],
  ]
> {
  /**
   * The polygon rings.
   */
  rings: [
    exteriorRing: GeometryLine,
    ...interiorRings: GeometryLine[],
  ];

  get coordinates() {
    return map(this.rings, line => line.coordinates);
  }

  /**
   * @param polygon - The polygon rings or another polygon geometry.
   */
  constructor(
    polygon:
      | readonly [exteriorRing: GeometryLine, ...interiorRings: GeometryLine[]]
      | GeometryPolygon,
  ) {
    super("Polygon");
    _defineAssertGeometryPolygon(this);
    this.rings = map(
      polygon instanceof GeometryPolygon ? polygon.rings : polygon,
      line => new GeometryLine(line),
    );
  }

  get exteriorRing() {
    return this.rings[0];
  }

  set exteriorRing(value: GeometryLine) {
    this.rings[0] = new GeometryLine(value);
  }

  get interiorRings() {
    return this.rings.slice(1);
  }

  set interiorRings(value: GeometryLine[]) {
    this.rings = [this.rings[0], ...value.map(ring => new GeometryLine(ring))];
  }
}

/**
 * A class representing a multi-point geometry.
 */
export class GeometryMultiPoint extends Geometry<
  "MultiPoint",
  GeometryPoint["coordinates"][]
> {
  /**
   * The points.
   */
  points: GeometryPoint[];

  get coordinates() {
    return map(this.points, g => g.coordinates);
  }

  /**
   * @param points - The points or another multi-point geometry.
   */
  constructor(points: readonly GeometryPoint[] | GeometryMultiPoint) {
    super("MultiPoint");
    _defineAssertGeometryMultiPoint(this);
    this.points = map(
      points instanceof GeometryMultiPoint ? points.points : points,
      point => new GeometryPoint(point),
    );
  }
}

/**
 * A class representing a multi-line geometry.
 */
export class GeometryMultiLine extends Geometry<
  "MultiLineString",
  GeometryLine["coordinates"][]
> {
  /**
   * The lines.
   */
  lines: GeometryLine[];

  get coordinates() {
    return map(this.lines, g => g.coordinates);
  }

  /**
   * @param lines - The lines or another multi-line geometry.
   */
  constructor(lines: readonly GeometryLine[] | GeometryMultiLine) {
    super("MultiLineString");
    _defineAssertGeometryMultiLine(this);
    this.lines = map(
      lines instanceof GeometryMultiLine ? lines.lines : lines,
      line => new GeometryLine(line),
    );
  }
}

/**
 * A class representing a multi-polygon geometry.
 */
export class GeometryMultiPolygon extends Geometry<
  "MultiPolygon",
  GeometryPolygon["coordinates"][]
> {
  /**
   * The polygons.
   */
  polygons: GeometryPolygon[];

  get coordinates() {
    return map(this.polygons, g => g.coordinates);
  }

  /**
   * @param polygons - The polygons or another multi-polygon geometry.
   */
  constructor(
    polygons: readonly GeometryPolygon[] | GeometryMultiPolygon,
  ) {
    super("MultiPolygon");
    _defineAssertGeometryMultiPolygon(this);
    this.polygons = map(
      polygons instanceof GeometryMultiPolygon ? polygons.polygons : polygons,
      polygon => new GeometryPolygon(polygon),
    );
  }
}

type Geo = Geometry<string, readonly unknown[]>;

/**
 * A class representing a geometry collection.
 *
 * @template T - The type of the geometries.
 */
export class GeometryCollection<
  T extends readonly [Geo, ...Geo[]] = readonly [Geo, ...Geo[]],
> extends Geometry<
  "GeometryCollection",
  { -readonly [K in keyof T]: ReturnType<T[K]["toJSON"]> }
> {
  /**
   * The geometries.
   */
  geometries: T;

  // @ts-expect-error
  get coordinates() {
    return map(this.geometries, g => g.toJSON());
  }

  /**
   * @param geometries - The geometries or another geometry collection.
   */
  constructor(geometries: T | GeometryCollection<T>) {
    super("GeometryCollection");
    _defineAssertGeometryCollection(this);

    if (geometries instanceof GeometryCollection) {
      geometries = geometries.geometries;
    }

    this.geometries = geometries;
  }
}
