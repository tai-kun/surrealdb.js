import {
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { describe, expect, test } from "vitest";
import surreal from "../surreal";

for (const { suite, fmt, url, Surreal } of surreal) {
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
        // undefined: undefined,
      };
      const expected = {
        bigint: 9007199254740992n,
        boolean: [true, false],
        date: new Datetime("2024-06-01T12:34:56.789Z"),
        null: null,
        number: 123,
        string: "文字列",
        // undefined: undefined,
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

    test.fails("undefined を null で返すおそらく SurrealDB 側のバグ", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      const input = {
        undefined: undefined,
      };
      const expected = {
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

      {
        const [output] = await db.query(
          /*surql*/ `
            RETURN $input;`,
          { input },
        );

        expect(input).toStrictEqual(output);
      }
      {
        // おそらく SurrealDB のクエリーパーサーのバグで失敗する。
        const promise = db.query(/*surql*/ `
          RETURN ${toSurql(input)};
        `);

        await expect(promise).rejects.toThrowError();

        // const [output] = await db.query(/*surql*/ `
        //   RETURN ${toSurql(input)};
        // `);

        // expect(input).toStrictEqual(output);
      }
    });
  });
}
