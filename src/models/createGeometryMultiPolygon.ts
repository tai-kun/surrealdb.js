import Abc from "./GeometryAbc";

export default function createGeometryMultiPolygon<
  TGeometryPolygon extends new(value: any) => {
    readonly coordinates: any;
  },
>(GeometryPolygon: TGeometryPolygon) {
  class GeometryMultiPolygon extends Abc<"MultiPolygon", {
    coordinates: InstanceType<TGeometryPolygon>["coordinates"][];
  }> {
    polygons: InstanceType<TGeometryPolygon>[];

    constructor(
      polygons:
        | readonly InstanceType<TGeometryPolygon>[]
        | GeometryMultiPolygon,
    ) {
      super("MultiPolygon");
      this.polygons = (polygons instanceof GeometryMultiPolygon
        ? polygons.polygons
        : polygons)
        .map(polygon =>
          new GeometryPolygon(polygon) as InstanceType<TGeometryPolygon>
        );
    }

    get coordinates(): InstanceType<TGeometryPolygon>["coordinates"][] {
      return this.polygons.map(polygon => polygon.coordinates);
    }

    _toJSON() {
      return {
        coordinates: this.coordinates,
      };
    }
  }

  return GeometryMultiPolygon;
}
