import { GeometryLineBase as Base } from "@tai-kun/surreal/cbor-values/encodable";
import { type Coord, isGeometryLine, map } from "~/cbor-values/geometry";
import { GeometryPoint, type GeometryPointBase } from "./geometry-point";

type Point = GeometryPointBase<Coord>;

export type { GeoJsonLineString } from "@tai-kun/surreal/cbor-values/encodable";

export class GeometryLineBase<P extends new(arg: any) => Point>
  extends Base<P>
{
  // @ts-expect-error readonly を外すだけ。
  override line: [
    InstanceType<P>,
    InstanceType<P>,
    ...InstanceType<P>[],
  ];

  override get coordinates(): [
    InstanceType<P>["coordinates"],
    InstanceType<P>["coordinates"],
    ...InstanceType<P>["coordinates"][],
  ] {
    return map(this.line, p => p.coordinates);
  }

  override set coordinates(
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

  clone(): this {
    // @ts-expect-error
    return new this.constructor(this._geo, {
      line: this.line.map(p => p.clone()),
    });
  }

  equals(other: unknown): boolean {
    return isGeometryLine<GeometryLineBase<P>>(other)
      && other.line.length === this.line.length
      && other.line.every((p, i) => this.line[i]!.equals(p));
  }

  isClosed(): boolean {
    return this.line[0].equals(this.line[this.line.length - 1]);
  }

  close(): void {
    if (!this.isClosed()) {
      this.line = [...this.line, this.line[0].clone()];
    }
  }

  toClosed(): this {
    const line = this.clone();
    line.close();

    return line;
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

  override clone(): this {
    // @ts-expect-error
    return new this.constructor({
      line: this.line.map(p => p.clone()),
    });
  }
}
