import { toSurql } from "@tai-kun/surreal";
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
} from "@tai-kun/surreal/values/full";
import assert from "@tools/assert";
import { beforeAll, describe, test } from "@tools/test";
import surreal from "../surreal.js";

for (const { suiteName, formatter, initSurreal } of surreal) {
  describe(suiteName, {
    skip: !(formatter === "cbor"),
  }, () => {
    beforeAll(async () => {
      await surreal.ready;
    });

    test("JavaScript ネイティブ", async () => {
      const { endpoint, Surreal, surql } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      const input = {
        string: "文字列",
        number: 123,
        bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
        boolean: [
          true,
          false,
        ],
        null: null,
        undefined: undefined,
        date: new Date("2024-06-01T12:34:56.789Z"),
      };
      const expected = {
        string: "文字列",
        number: 123,
        bigint: 9007199254740992n,
        boolean: [
          true,
          false,
        ],
        null: null,
        undefined: undefined,
        date: new Datetime("2024-06-01T12:34:56.789Z"),
      };

      {
        const [output] = await db.query(surql`
          RETURN ${input}
        `);
        assert.deepEqual(output, expected);
      }
      {
        const [output] = await db.query(surql`
          RETURN ${surql.raw(toSurql(input))}
        `);
        assert.deepEqual(output, expected);
      }
    });

    test("SurrealQL 独自の値", async () => {
      const { endpoint, Surreal, surql } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      const geometryPoint = new GeometryPoint([1, "3.14"]);
      const geometryLine = new GeometryLine([new GeometryPoint([1, 2])]);
      const geometryPolygon = new GeometryPolygon([
        new GeometryLine([new GeometryPoint([1, 1])]),
        new GeometryLine([new GeometryPoint([4, 1])]),
        new GeometryLine([new GeometryPoint([4, 4])]),
        new GeometryLine([new GeometryPoint([1, 4])]),
        new GeometryLine([new GeometryPoint([1, 1])]),
      ]);
      const geometryMultiPoint = new GeometryMultiPoint([
        new GeometryPoint([1, 2]),
      ]);
      const geometryMultiLine = new GeometryMultiLine([
        new GeometryLine([
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
        thing: new Thing(new Table("user"), { name: "tai-kun" }),
        uuidv1: new Uuid("ad7aea20-2c9b-11ef-9454-0242ac120002"),
        uuidv4: new Uuid("e1edeaeb-6413-469a-8e5f-cfbc085a5584"),
        uuidv7: new Uuid("019025ed-803c-7b9a-b0b0-cd884d7bb4fb"),
      };

      {
        const [output] = await db.query<[any]>(surql`
          RETURN ${input}
        `);
        assert.jsonEqual(output, input);
      }
      {
        const [output] = await db.query<[any]>(surql`
          RETURN ${surql.raw(toSurql(input))}
        `);
        assert.jsonEqual(output, input);
      }
    });
  });
}
