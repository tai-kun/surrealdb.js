import {
  BoundExcluded,
  BoundIncluded,
  Datetime,
  Decimal,
  Duration,
  Future,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Range,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { describe, expect, test } from "vitest";
import surreal from "../surreal";

for (const { suite, fmt, url, ver, Surreal } of surreal) {
  describe.runIf(fmt === "cbor")(suite, () => {
    test("JavaScript ネイティブ", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      const input = {
        bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
        boolean: [true, false],
        date: new Date("2024-06-01T12:34:56.789Z"),
        null: null,
        number: 123,
        string: "文字列",
        undefined: undefined,
      };
      const expected = {
        bigint: 9007199254740992n,
        boolean: [true, false],
        date: new Datetime("2024-06-01T12:34:56.789Z"),
        null: null,
        number: 123,
        string: "文字列",
        undefined: undefined,
      };

      {
        const [output] = await db.query(
          /*surql*/ `
            RETURN $input;`,
          { input },
        );

        expect(output).toStrictEqual(expected);
      }
      {
        const [output] = await db.query(/*surql*/ `
          RETURN ${toSurql(input)};
        `);

        expect(output).toStrictEqual(expected);
      }
    });

    test("SurrealQL 独自の値", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      const geometryPoint = new GeometryPoint([1, "3.14"]);
      const geometryLine = new GeometryLine([
        new GeometryPoint([1, 2]),
        new GeometryPoint([3, 4]),
      ]);
      const geometryPolygon = new GeometryPolygon([
        new GeometryLine([
          new GeometryPoint([1, 1]),
          new GeometryPoint([1, 1]),
        ]),
        new GeometryLine([
          new GeometryPoint([4, 1]),
          new GeometryPoint([4, 1]),
        ]),
        new GeometryLine([
          new GeometryPoint([4, 4]),
          new GeometryPoint([4, 4]),
        ]),
        new GeometryLine([
          new GeometryPoint([1, 4]),
          new GeometryPoint([1, 4]),
        ]),
        new GeometryLine([
          new GeometryPoint([1, 1]),
          new GeometryPoint([1, 1]),
        ]),
      ]);
      const geometryMultiPoint = new GeometryMultiPoint([
        new GeometryPoint([1, 2]),
      ]);
      const geometryMultiLine = new GeometryMultiLine([
        new GeometryLine([
          new GeometryPoint([1, 2]),
          new GeometryPoint([1, 2]),
        ]),
      ]);
      const geometryMultiPolygon = new GeometryMultiPolygon([
        geometryPolygon,
      ]);
      const input = {
        datetime: new Datetime([
          Date.UTC(2024, 6 - 1, 1, 12, 34, 56) / 1_000,
          123_456_789,
        ]),
        decimal: new Decimal("3.1415926"),
        duration: new Duration("1y2w3d4h5m6s7ms8us9ns"),
        geometryPoint,
        geometryLine,
        geometryPolygon,
        geometryMultiPoint,
        geometryMultiLine,
        geometryMultiPolygon,
        geometryCollection: new GeometryCollection([
          geometryPoint,
          geometryLine,
          geometryPolygon,
          geometryMultiPoint,
          geometryMultiLine,
          geometryMultiPolygon,
        ]),
        thing: {
          object: new Thing(
            new Table("user"),
            { name: "tai-kun" },
          ),
          uuidv7: new Thing(
            new Table("user"),
            new Uuid("019025ed-803c-7b9a-b0b0-cd884d7bb4fb"),
          ),
        },
        uuidv1: new Uuid("ad7aea20-2c9b-11ef-9454-0242ac120002"),
        uuidv4: new Uuid("e1edeaeb-6413-469a-8e5f-cfbc085a5584"),
        uuidv7: new Uuid("019025ed-803c-7b9a-b0b0-cd884d7bb4fb"),
      };
      const expected = {
        ...input,
      };

      {
        const [output] = await db.query(
          /*surql*/ `
            RETURN $input;`,
          { input },
        );

        expect(output).toStrictEqual(expected);
      }
      {
        // おそらく SurrealDB のクエリーパーサーのバグで失敗する。
        const promise = db.query(/*surql*/ `
          RETURN ${toSurql(input)};
        `);

        await expect(promise).rejects.toThrowError();
      }
    });

    test("Range", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await expect(
        db.query(/* surql */ `
          RETURN 1..3;
          RETURN 1..;
          RETURN ..3;
          RETURN ..;
        `),
      )
        .resolves
        .toStrictEqual([
          new Range([new BoundIncluded(1), new BoundExcluded(3)]),
          new Range([new BoundIncluded(1), null]),
          new Range([null, new BoundExcluded(3)]),
          new Range([null, null]),
        ]);
    });

    test("IdRange", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await expect(
        db.query(/* surql */ `
          RETURN foo:1..3;
          RETURN foo:1..;
          RETURN foo:..3;
          RETURN foo:..;
        `),
      )
        .resolves
        .toStrictEqual([
          new Thing(
            "foo",
            new Range([new BoundIncluded(1), new BoundExcluded(3)]),
          ),
          new Thing("foo", new Range([new BoundIncluded(1), null])),
          new Thing("foo", new Range([null, new BoundExcluded(3)])),
          new Thing("foo", new Range([null, null])),
        ]);
    });

    test("Futrue", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await expect(
        db.query(
          /* surql */ `
          RETURN $future;
        `,
          {
            future: new Future("{ string::concat('Hello', ' ', 'World') }"),
          },
        ),
      )
        .resolves
        .toStrictEqual([
          "Hello World",
        ]);
    });
  });
}
