import Abc from "./GeometryAbc";

const map = <T extends readonly unknown[], U>(
  list: T,
  func: (item: T[number]) => U,
) => list.map(func) as { -readonly [K in keyof T]: U };

export default function createGeometryMultiPolygon<
  TGeometryPolygon extends new(value: any) => {
    readonly coordinates: any;
  },
>(GeometryPolygon: TGeometryPolygon) {
  class GeometryMultiPolygon extends Abc<"MultiPolygon", {
    coordinates: InstanceType<TGeometryPolygon>["coordinates"][];
  }> {
    polygons: [
      InstanceType<TGeometryPolygon>,
      ...InstanceType<TGeometryPolygon>[],
    ];

    constructor(
      polygons:
        | readonly [
          InstanceType<TGeometryPolygon>,
          ...InstanceType<TGeometryPolygon>[],
        ]
        | GeometryMultiPolygon,
    ) {
      super("MultiPolygon");
      this.polygons = map(
        polygons instanceof GeometryMultiPolygon ? polygons.polygons : polygons,
        polygon =>
          new GeometryPolygon(polygon) as InstanceType<TGeometryPolygon>,
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
