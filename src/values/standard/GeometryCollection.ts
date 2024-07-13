import { unreachable } from "~/errors";
import toSurql from "~/index/toSurql";
import { type Coord, GeometryAbc, type GeometryType } from "../_lib/geometry";
import type { Encodable } from "../_lib/types";
import type { GeoJsonCollection } from "../encodable/GeometryCollection";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";
import {
  GeometryMultiLine,
  type GeometryMultiLineBase,
} from "./GeometryMultiLine";
import {
  GeometryMultiPoint,
  type GeometryMultiPointBase,
} from "./GeometryMultiPoint";
import {
  GeometryMultiPolygon,
  type GeometryMultiPolygonBase,
} from "./GeometryMultiPolygon";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";
import { GeometryPolygon, type GeometryPolygonBase } from "./GeometryPolygon";

export type * from "../encodable/GeometryCollection";

type Point = GeometryPointBase<Coord>;
type MultiPoint = GeometryMultiPointBase<new(_: any) => any>;
type Line = GeometryLineBase<new(_: any) => any>;
type MultiLine = GeometryMultiLineBase<new(_: any) => any>;
type Polygon = GeometryPolygonBase<new(_: any) => any>;
type MultiPolygon = GeometryMultiPolygonBase<new(_: any) => any>;

export class GeometryCollectionBase<
  Pt extends new(arg: any) => Point,
  MPt extends new(arg: any) => MultiPoint,
  Li extends new(arg: any) => Line,
  MLi extends new(arg: any) => MultiLine,
  Pg extends new(arg: any) => Polygon,
  MPg extends new(arg: any) => MultiPolygon,
> extends GeometryAbc<"GeometryCollection"> implements Encodable {
  protected readonly _geo: {
    readonly Point: Pt;
    readonly MultiPoint: MPt;
    readonly Line: Li;
    readonly MultiLine: MLi;
    readonly Polygon: Pg;
    readonly MultiPolygon: MPg;
  };

  collection: readonly (
    | InstanceType<Pt>
    | InstanceType<MPt>
    | InstanceType<Li>
    | InstanceType<MLi>
    | InstanceType<Pg>
    | InstanceType<MPg>
  )[];

  constructor(
    geo: {
      readonly Point: Pt;
      readonly MultiPoint: MPt;
      readonly Line: Li;
      readonly MultiLine: MLi;
      readonly Polygon: Pg;
      readonly MultiPolygon: MPg;
    },
    collection:
      | readonly (
        | InstanceType<Pt>
        | InstanceType<MPt>
        | InstanceType<Li>
        | InstanceType<MLi>
        | InstanceType<Pg>
        | InstanceType<MPg>
      )[]
      | Readonly<
        Pick<GeometryCollectionBase<Pt, MPt, Li, MLi, Pg, MPg>, "collection">
      >,
  ) {
    super("GeometryCollection");
    this._geo = geo;
    this.collection = !Array.isArray(collection)
      ? [...collection.collection]
      : [...collection];
  }

  get geometries(): (
    | ReturnType<InstanceType<Pt>["structure"]>
    | ReturnType<InstanceType<MPt>["structure"]>
    | ReturnType<InstanceType<Li>["structure"]>
    | ReturnType<InstanceType<MLi>["structure"]>
    | ReturnType<InstanceType<Pg>["structure"]>
    | ReturnType<InstanceType<MPg>["structure"]>
  )[] {
    return this.collection.map((g): any =>
      g.structure() satisfies {
        type: GeometryType;
      }
    );
  }

  set geometries(
    v: readonly (
      | ReturnType<InstanceType<Pt>["structure"]>
      | ReturnType<InstanceType<MPt>["structure"]>
      | ReturnType<InstanceType<Li>["structure"]>
      | ReturnType<InstanceType<MLi>["structure"]>
      | ReturnType<InstanceType<Pg>["structure"]>
      | ReturnType<InstanceType<MPg>["structure"]>
    )[],
  ) {
    this.collection = v.map(g => {
      switch (g.type) {
        case "Point":
          return new this._geo.Point(g) as InstanceType<Pt>;

        case "MultiPoint":
          return new this._geo.MultiPoint(g) as InstanceType<MPt>;

        case "LineString":
          return new this._geo.Line(g) as InstanceType<Li>;

        case "MultiLineString":
          return new this._geo.MultiLine(g) as InstanceType<MLi>;

        case "Polygon":
          return new this._geo.Polygon(g) as InstanceType<Pg>;

        case "MultiPolygon":
          return new this._geo.MultiPolygon(g) as InstanceType<MPg>;

        default:
          unreachable();
      }
    });
  }

  toJSON(): GeoJsonCollection {
    return {
      type: this.type,
      geometries: this.collection.map(p => p.toJSON()),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      geometries: this.geometries,
    });
  }

  structure(): {
    type: "GeometryCollection";
    geometries: (
      | ReturnType<InstanceType<Pt>["structure"]>
      | ReturnType<InstanceType<MPt>["structure"]>
      | ReturnType<InstanceType<Li>["structure"]>
      | ReturnType<InstanceType<MLi>["structure"]>
      | ReturnType<InstanceType<Pg>["structure"]>
      | ReturnType<InstanceType<MPg>["structure"]>
    )[];
  } {
    return {
      type: this.type,
      geometries: this.geometries,
    };
  }
}

export class GeometryCollection extends GeometryCollectionBase<
  typeof GeometryPoint,
  typeof GeometryMultiPoint,
  typeof GeometryLine,
  typeof GeometryMultiLine,
  typeof GeometryPolygon,
  typeof GeometryMultiPolygon
> {
  static readonly Point = GeometryPoint;
  static readonly MultiPoint = GeometryMultiPoint;
  static readonly Line = GeometryLine;
  static readonly MultiLine = GeometryMultiLine;
  static readonly Polygon = GeometryPolygon;
  static readonly MultiPolygon = GeometryMultiPolygon;

  constructor(
    collection:
      | readonly (
        | GeometryPoint
        | GeometryMultiPoint
        | GeometryLine
        | GeometryMultiLine
        | GeometryPolygon
        | GeometryMultiPolygon
      )[]
      | Readonly<Pick<GeometryCollection, "collection">>,
  ) {
    super(GeometryCollection, collection);
  }
}
