import Abc from "./GeometryAbc";

export default function createGeometryMultiLine<
  TGeometryLine extends new(value: any) => {
    readonly coordinates: any;
  },
>(GeometryLine: TGeometryLine) {
  class GeometryMultiLine extends Abc<"MultiLineString", {
    coordinates: InstanceType<TGeometryLine>["coordinates"][];
  }> {
    lines: InstanceType<TGeometryLine>[];

    constructor(
      lines:
        | readonly InstanceType<TGeometryLine>[]
        | GeometryMultiLine,
    ) {
      super("MultiLineString");
      this.lines = (lines instanceof GeometryMultiLine ? lines.lines : lines)
        .map(line => new GeometryLine(line) as InstanceType<TGeometryLine>);
    }

    get coordinates(): InstanceType<TGeometryLine>["coordinates"][] {
      return this.lines.map(line => line.coordinates);
    }

    _toJSON() {
      return {
        coordinates: this.coordinates,
      };
    }
  }

  return GeometryMultiLine;
}
