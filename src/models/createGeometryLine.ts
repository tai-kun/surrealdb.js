import Abc from "./GeometryAbc";

export default function createGeometryLine<
  TGeometryPoint extends new(value: any) => {
    readonly coordinates: any;
  },
>(GeometryPoint: TGeometryPoint) {
  class GeometryLine extends Abc<"LineString", {
    coordinates: InstanceType<TGeometryPoint>["coordinates"][];
  }> {
    line: InstanceType<TGeometryPoint>[];

    constructor(
      line:
        | readonly InstanceType<TGeometryPoint>[]
        | GeometryLine,
    ) {
      super("LineString");
      this.line = (line instanceof GeometryLine ? line.line : line).map(point =>
        new GeometryPoint(point) as InstanceType<TGeometryPoint>
      );
    }

    get coordinates(): InstanceType<TGeometryPoint>["coordinates"][] {
      return this.line.map(point => point.coordinates);
    }

    _toJSON() {
      return {
        coordinates: this.coordinates,
      };
    }
  }

  return GeometryLine;
}
