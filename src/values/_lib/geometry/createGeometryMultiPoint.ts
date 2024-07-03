import Abc from "./Abc";

export default function createGeometryMultiPoint<
  TGeometryPoint extends new(value: any) => {
    readonly coordinates: any;
  },
>(GeometryPoint: TGeometryPoint) {
  class GeometryMultiPoint extends Abc<"MultiPoint", {
    coordinates: InstanceType<TGeometryPoint>["coordinates"][];
  }> {
    points: InstanceType<TGeometryPoint>[];

    constructor(
      points:
        | readonly InstanceType<TGeometryPoint>[]
        | GeometryMultiPoint,
    ) {
      super("MultiPoint");
      this.points = (points instanceof GeometryMultiPoint
        ? points.points
        : points)
        .map(point => new GeometryPoint(point) as InstanceType<TGeometryPoint>);
    }

    get coordinates(): InstanceType<TGeometryPoint>["coordinates"][] {
      return this.points.map(point => point.coordinates);
    }

    _toJSON() {
      return {
        coordinates: this.coordinates,
      };
    }
  }

  return GeometryMultiPoint;
}
