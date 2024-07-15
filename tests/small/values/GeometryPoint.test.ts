import { isGeometryPoint } from "@tai-kun/surreal/values";
import {
  GeometryPoint as DecodeOnlyGeometryPoint,
  GeometryPointBase as DecodeOnlyGeometryPointBase,
} from "@tai-kun/surreal/values/decode-only";
import {
  GeometryPoint as EncodableGeometryPoint,
  GeometryPointBase as EncodableGeometryPointBase,
} from "@tai-kun/surreal/values/encodable";
import {
  Decimal,
  GeometryPoint as FullGeometryPoint,
  GeometryPointBase as FullGeometryPointBase,
} from "@tai-kun/surreal/values/full";
import {
  GeometryPoint as StandardGeometryPoint,
  GeometryPointBase as StandardGeometryPointBase,
} from "@tai-kun/surreal/values/standard";
import assert from "@tools/assert";
import { describe, test } from "@tools/test";

describe("decode-only", () => {
  const GeometryPoint = DecodeOnlyGeometryPoint;
  const GeometryPointBase = DecodeOnlyGeometryPointBase;

  test("座標の配列を渡して GeometryPoint を作成する", () => {
    const g = new GeometryPoint([1, 2]);

    assert(g instanceof GeometryPoint, "GeometryPoint のインスタンス");
    assert.deepJsonEqual(g.point, [1, 2], "座標");
  });

  test("インスタンスを渡してインスタンスを作成する", () => {
    const p = new GeometryPoint([1, 2]);
    const g = new GeometryPoint(p);

    assert(g instanceof GeometryPoint, "GeometryPoint のインスタンス");
    assert.deepJsonEqual(g.point, [1, 2], "座標");
  });

  test("GeometryPoint であると判定できる", () => {
    assert(isGeometryPoint(new GeometryPoint([0, 1])));
  });

  describe("decimal", () => {
    class DecimalGeometryPoint extends GeometryPointBase<typeof Decimal> {
      constructor(
        point: [
          x: ConstructorParameters<typeof Decimal>[0],
          y: ConstructorParameters<typeof Decimal>[0],
        ],
      ) {
        super({ Coord: Decimal }, point);
      }
    }

    test("座標を Decimal にすることができきる", () => {
      const r2 = new Decimal(1.41421356);
      const g = new DecimalGeometryPoint([r2, "2.4360679"]);

      assert(
        !(g instanceof GeometryPoint),
        "GeometryPoint のインスタンスではない",
      );
      assert(
        g instanceof DecimalGeometryPoint,
        "DecimalGeometryPoint のインスタンス",
      );
      assert.equal(g.point[0], r2, "値は複製されない");
      assert.deepJsonEqual(g.point, ["1.41421356", "2.4360679"]);
    });

    test("GeometryPoint であると判定できる", () => {
      assert(isGeometryPoint(new DecimalGeometryPoint([0, 1])));
    });
  });
});

describe("encodable", () => {
  const GeometryPoint = EncodableGeometryPoint;
  const GeometryPointBase = EncodableGeometryPointBase;

  test("JSON 表現", () => {
    const g = new GeometryPoint([1, 2]);

    assert.deepEqual(g.toJSON(), {
      type: "Point",
      coordinates: [1, 2],
    });
  });

  test("SurrealQL 表現", () => {
    const g = new GeometryPoint([1, 2]);

    assert.equal(g.toSurql(), "{coordinates:[1,2],type:s'Point'}");
  });

  test("構造化", () => {
    const g = new GeometryPoint([1, 2]);

    assert.deepEqual(g.structure(), {
      type: "Point",
      point: [1, 2],
    });
  });

  test("GeometryPoint であると判定できる", () => {
    assert(isGeometryPoint(new GeometryPoint([0, 1])));
  });

  describe("decimal", () => {
    class DecimalGeometryPoint extends GeometryPointBase<typeof Decimal> {
      constructor(
        point: [
          x: ConstructorParameters<typeof Decimal>[0],
          y: ConstructorParameters<typeof Decimal>[0],
        ],
      ) {
        super({ Coord: Decimal }, point);
      }
    }

    test("JSON 表現", () => {
      const g = new DecimalGeometryPoint([1, 2]);

      assert.deepEqual(g.toJSON(), {
        type: "Point",
        coordinates: [1, 2],
      });
    });

    test("SurrealQL 表現", () => {
      const g = new DecimalGeometryPoint([1, 2]);

      assert.equal(g.toSurql(), "{coordinates:[1dec,2dec],type:s'Point'}");
    });

    test("構造化", () => {
      const g = new DecimalGeometryPoint([1, 2]);

      assert.deepEqual(g.structure(), {
        type: "Point",
        point: [new Decimal(1), new Decimal(2)],
      });
    });

    test("GeometryPoint であると判定できる", () => {
      assert(isGeometryPoint(new DecimalGeometryPoint([0, 1])));
    });
  });
});

describe("standard", () => {
  const GeometryPoint = StandardGeometryPoint;
  const GeometryPointBase = StandardGeometryPointBase;

  test("座標の配列を渡して GeometryPoint を作成する", () => {
    const g = new GeometryPoint([1, 2]);

    assert(g instanceof GeometryPoint, "GeometryPoint のインスタンス");
    assert.deepJsonEqual(g.point, [1, 2], "座標");
  });

  test("インスタンスを渡してインスタンスを作成する", () => {
    const p = new GeometryPoint([1, 2]);
    const g = new GeometryPoint(p);

    assert(g instanceof GeometryPoint, "GeometryPoint のインスタンス");
    assert.deepJsonEqual(g.point, [1, 2], "座標");
  });

  test("GeometryPoint であると判定できる", () => {
    assert(isGeometryPoint(new GeometryPoint([0, 1])));
  });

  describe("decimal", () => {
    class DecimalGeometryPoint extends GeometryPointBase<typeof Decimal> {
      constructor(
        point: [
          x: ConstructorParameters<typeof Decimal>[0],
          y: ConstructorParameters<typeof Decimal>[0],
        ],
      ) {
        super({ Coord: Decimal }, point);
      }
    }

    test("座標を Decimal にすることができきる", () => {
      const r2 = new Decimal(1.41421356);
      const g = new DecimalGeometryPoint([r2, "2.4360679"]);

      assert(
        !(g instanceof GeometryPoint),
        "GeometryPoint のインスタンスではない",
      );
      assert(
        g instanceof DecimalGeometryPoint,
        "DecimalGeometryPoint のインスタンス",
      );
      assert.equal(g.point[0], r2, "値は複製されない");
      assert.deepJsonEqual(g.point, ["1.41421356", "2.4360679"]);
    });

    test("GeometryPoint であると判定できる", () => {
      assert(isGeometryPoint(new DecimalGeometryPoint([0, 1])));
    });
  });

  test("JSON 表現", () => {
    const g = new GeometryPoint([1, 2]);

    assert.deepEqual(g.toJSON(), {
      type: "Point",
      coordinates: [1, 2],
    });
  });

  test("SurrealQL 表現", () => {
    const g = new GeometryPoint([1, 2]);

    assert.equal(g.toSurql(), "{coordinates:[1,2],type:s'Point'}");
  });

  test("構造化", () => {
    const g = new GeometryPoint([1, 2]);

    assert.deepEqual(g.structure(), {
      type: "Point",
      point: [1, 2],
    });
  });

  test("GeometryPoint であると判定できる", () => {
    assert(isGeometryPoint(new GeometryPoint([0, 1])));
  });

  describe("decimal", () => {
    class DecimalGeometryPoint extends GeometryPointBase<typeof Decimal> {
      constructor(
        point: [
          x: ConstructorParameters<typeof Decimal>[0],
          y: ConstructorParameters<typeof Decimal>[0],
        ],
      ) {
        super({ Coord: Decimal }, point);
      }
    }

    test("JSON 表現", () => {
      const g = new DecimalGeometryPoint([1, 2]);

      assert.deepEqual(g.toJSON(), {
        type: "Point",
        coordinates: [1, 2],
      });
    });

    test("SurrealQL 表現", () => {
      const g = new DecimalGeometryPoint([1, 2]);

      assert.equal(g.toSurql(), "{coordinates:[1dec,2dec],type:s'Point'}");
    });

    test("構造化", () => {
      const g = new DecimalGeometryPoint([1, 2]);

      assert.deepEqual(g.structure(), {
        type: "Point",
        point: [new Decimal(1), new Decimal(2)],
      });
    });

    test("GeometryPoint であると判定できる", () => {
      assert(isGeometryPoint(new DecimalGeometryPoint([0, 1])));
    });
  });
});

describe("full", () => {
  const GeometryPoint = FullGeometryPoint;
  const GeometryPointBase = FullGeometryPointBase;

  test("複製", () => {
    const g1 = new GeometryPoint([1, 2]);
    const g2 = g1.clone();

    assert.notEqual(g1, g2, "!==");
    assert.deepJsonEqual(g1, g2, "JSON");
  });

  test("同じ", () => {
    const g1 = new GeometryPoint([1, 2]);
    const g2 = new GeometryPoint([1, 2]);

    assert(g1.equal(g2), "g1.equal");
    assert(g2.equal(g1), "g2.equal");
  });

  test("GeometryPoint であると判定できる", () => {
    assert(isGeometryPoint(new GeometryPoint([0, 1])));
  });

  describe("decimal", () => {
    class DecimalGeometryPoint extends GeometryPointBase<typeof Decimal> {
      constructor(
        point: [
          x: ConstructorParameters<typeof Decimal>[0],
          y: ConstructorParameters<typeof Decimal>[0],
        ],
      ) {
        super({ Coord: Decimal }, point);
      }
    }

    test("複製", () => {
      const g1 = new DecimalGeometryPoint([1, 2]);
      const g2 = g1.clone();

      assert.notEqual(g1, g2, "!==");
      assert.deepJsonEqual(g1, g2, "JSON");
    });

    test("同じ", () => {
      const g1 = new DecimalGeometryPoint([1, 2]);
      const g2 = new DecimalGeometryPoint([1, 2]);

      assert(g1.equal(g2), "g1.equal");
      assert(g2.equal(g1), "g2.equal");
    });

    test("GeometryPoint であると判定できる", () => {
      assert(isGeometryPoint(new DecimalGeometryPoint([0, 1])));
    });
  });
});
