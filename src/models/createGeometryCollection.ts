import Abc from "./GeometryAbc";

export default function createGeometryCollection<
  TGeometryPoint extends new(value: any) => any,
  TGeometryLine extends new(value: any) => any,
  TGeometryPolygon extends new(value: any) => any,
  TGeometryMultiPoint extends new(value: any) => any,
  TGeometryMultiLine extends new(value: any) => any,
  TGeometryMultiPolygon extends new(value: any) => any,
> // TGeometryCollection extends new(value: any) => any,
() {
  type GeometryInstanceType =
    | InstanceType<TGeometryPoint>
    | InstanceType<TGeometryLine>
    | InstanceType<TGeometryPolygon>
    | InstanceType<TGeometryMultiPoint>
    | InstanceType<TGeometryMultiLine>
    | InstanceType<TGeometryMultiPolygon>;
  //  | InstanceType<TGeometryCollection>;

  class GeometryCollection<
    T extends readonly [GeometryInstanceType, ...GeometryInstanceType[]],
  > extends Abc<"GeometryCollection", {
    geometries: {
      [K in keyof T]: ReturnType<T[K]["toJSON"]>;
    };
  }> {
    collection: T;

    constructor(collection: T | GeometryCollection<T>) {
      super("GeometryCollection");
      this.collection = collection instanceof GeometryCollection
        ? collection.collection
        : collection;
    }

    get geometries(): {
      [K in keyof T]: ReturnType<T[K]["toJSON"]>;
    } {
      // @ts-expect-error
      return this.collection.map(geometry => geometry.toJSON());
    }

    _toJSON() {
      return {
        geometries: this.geometries,
      };
    }
  }

  return GeometryCollection;
}
