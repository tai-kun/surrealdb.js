import Abc from "./Abc";

const map = <T extends readonly unknown[], U>(
  list: T,
  func: (item: T[number]) => U,
) => list.map(func) as { -readonly [K in keyof T]: U };

export default function createGeometryPoint<
  TDecimal extends new(value: any) => any,
>(Decimal: TDecimal) {
  class GeometryPoint extends Abc<"Point", {
    coordinates: [x: InstanceType<TDecimal>, y: InstanceType<TDecimal>];
  }> {
    point: [x: InstanceType<TDecimal>, y: InstanceType<TDecimal>];

    constructor(
      point:
        | readonly [
          x: number | string | InstanceType<TDecimal>,
          y: number | string | InstanceType<TDecimal>,
        ]
        | GeometryPoint,
    ) {
      super("Point");
      this.point = map(
        point instanceof GeometryPoint ? point.point : point,
        coord => new Decimal(coord),
      );
    }

    get x(): InstanceType<TDecimal> {
      return this.point[0];
    }

    set x(value: number | string | InstanceType<TDecimal>) {
      this.point = [
        typeof value == "object" ? value : new Decimal(value),
        this.point[1],
      ];
    }

    get y(): InstanceType<TDecimal> {
      return this.point[1];
    }

    set y(value: number | string | InstanceType<TDecimal>) {
      this.point = [
        this.point[0],
        typeof value == "object" ? value : new Decimal(value),
      ];
    }

    get coordinates(): [x: InstanceType<TDecimal>, y: InstanceType<TDecimal>] {
      return this.point;
    }

    _toJSON() {
      return {
        coordinates: this.coordinates,
      };
    }
  }

  return GeometryPoint;
}
