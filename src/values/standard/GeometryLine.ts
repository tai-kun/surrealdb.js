import toSurql from "~/index/toSurql";
import { type Coord, GeometryAbc } from "../_lib/geometry";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import type { GeoJsonLineString } from "../encodable/GeometryLine";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";

export type * from "../encodable/GeometryLine";

type Point = GeometryPointBase<Coord>;

export class GeometryLineBase<P extends new(...args: any) => Point>
  extends GeometryAbc<"LineString">
  implements Encodable
{
  protected readonly _geo: {
    readonly Point: P;
  };

  line: [InstanceType<P>, InstanceType<P>, ...InstanceType<P>[]];

  constructor(
    geo: {
      readonly Point: P;
    },
    line:
      | readonly [
        ConstructorParameters<P>[0],
        ConstructorParameters<P>[0],
        ...ConstructorParameters<P>[0][],
      ]
      | Readonly<Pick<GeometryLineBase<P>, "line">>,
  ) {
    super("LineString");
    this._geo = geo;
    this.line = !Array.isArray(line)
      ? [...line.line]
      : map(
        line,
        (p: any) =>
          (p instanceof geo.Point ? p : new geo.Point(p)) as InstanceType<P>,
      );
  }

  get coordinates(): [
    InstanceType<P>["coordinates"],
    InstanceType<P>["coordinates"],
    ...InstanceType<P>["coordinates"][],
  ] {
    return map(this.line, p => p.coordinates);
  }

  set coordinates(
    v: readonly [
      ConstructorParameters<P>[0],
      ConstructorParameters<P>[0],
      ...ConstructorParameters<P>[0][],
    ],
  ) {
    this.line = map(
      v,
      (p: any) =>
        (p instanceof this._geo.Point
          ? p
          : new this._geo.Point(p)) as InstanceType<P>,
    );
  }

  toJSON(): GeoJsonLineString {
    return {
      type: this.type,
      coordinates: map(this.line, p => p.toJSON().coordinates),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      coordinates: this.coordinates,
    });
  }

  structure(): {
    type: "LineString";
    line: [InstanceType<P>, InstanceType<P>, ...InstanceType<P>[]];
  } {
    return {
      type: this.type,
      line: this.line,
    };
  }
}

export class GeometryLine extends GeometryLineBase<typeof GeometryPoint> {
  static readonly Point = GeometryPoint;

  constructor(
    line:
      | readonly [
        ConstructorParameters<typeof GeometryPoint>[0],
        ConstructorParameters<typeof GeometryPoint>[0],
        ...ConstructorParameters<typeof GeometryPoint>[0][],
      ]
      | Readonly<Pick<GeometryLine, "line">>,
  ) {
    super(GeometryLine, line);
  }
}
