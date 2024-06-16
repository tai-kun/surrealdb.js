import Abc from "./GeometryAbc";

const map = <T extends readonly unknown[], U>(
  list: T,
  func: (item: T[number]) => U,
) => list.map(func) as { -readonly [K in keyof T]: U };

export default function createGeometryPolygon<
  TGeometryLine extends new(value: any) => {
    readonly coordinates: any;
  },
>(GeometryLine: TGeometryLine) {
  class GeometryPolygon extends Abc<"Polygon", {
    coordinates: [
      exteriorRing: InstanceType<TGeometryLine>["coordinates"],
      ...interiorRings: InstanceType<TGeometryLine>["coordinates"][],
    ];
  }> {
    polygon: [
      exteriorRing: InstanceType<TGeometryLine>,
      ...interiorRings: InstanceType<TGeometryLine>[],
    ];

    constructor(
      polygon:
        | readonly [
          exteriorRing: InstanceType<TGeometryLine>,
          ...interiorRings: InstanceType<TGeometryLine>[],
        ]
        | GeometryPolygon,
    ) {
      super("Polygon");
      this.polygon = map(
        polygon instanceof GeometryPolygon ? polygon.polygon : polygon,
        line => new GeometryLine(line) as InstanceType<TGeometryLine>,
      );
    }

    get exteriorRing(): InstanceType<TGeometryLine> {
      return this.polygon[0];
    }

    set exteriorRing(value: InstanceType<TGeometryLine>) {
      this.polygon = [value, ...this.polygon.slice(1)];
    }

    // interiorRings が muttable ではないことに注意する。
    get interiorRings(): InstanceType<TGeometryLine>[] {
      return this.polygon.slice(1);
    }

    set interiorRings(value: InstanceType<TGeometryLine>[]) {
      this.polygon = [this.polygon[0], ...value];
    }

    get coordinates(): [
      exteriorRing: InstanceType<TGeometryLine>["coordinates"],
      ...interiorRings: InstanceType<TGeometryLine>["coordinates"][],
    ] {
      return map(this.polygon, line => line.coordinates);
    }

    _toJSON() {
      return {
        coordinates: this.coordinates,
      };
    }
  }

  return GeometryPolygon;
}
