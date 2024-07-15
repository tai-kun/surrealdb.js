import type { Coord } from "../../_shared/Geometry";
import { GeometryLineBase as Base } from "../../standard/src/GeometryLine";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";

export type * from "../../standard/src/GeometryLine";

type Point = GeometryPointBase<Coord>;

export class GeometryLineBase<P extends new(arg: any) => Point>
  extends Base<P>
{
  clone(): this {
    // @ts-expect-error
    return new this.constructor({
      line: this.line.map(p => p.clone()),
    });
  }

  equal(other: unknown): boolean {
    return other instanceof GeometryLineBase
      && other.line.length === this.line.length
      && other.line.every((p, i) => this.line[i]!.equal(p));
  }

  isClosed(): boolean {
    return this.line[0].equal(this.line[this.line.length - 1]);
  }

  close(): void {
    if (!this.isClosed()) {
      this.line = [...this.line, this.line[0].clone()];
    }
  }

  toClosed(): this {
    const line = this.clone();

    if (!line.isClosed()) {
      line.close();
    }

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
}
