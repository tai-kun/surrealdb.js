import Abc from "./Abc";

export default function createGeometryCollection<
  TGeometry extends { readonly toJSON: () => any },
>() {
  class GeometryCollection<
    T extends readonly [TGeometry, ...TGeometry[]],
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
