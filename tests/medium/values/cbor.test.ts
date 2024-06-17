import { initSurreal, toSurql } from "@tai-kun/surrealdb";
import { httpEngine } from "@tai-kun/surrealdb/engines";
import { CborFormatter } from "@tai-kun/surrealdb/formatters";
import {
  Client,
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
} from "@tai-kun/surrealdb/full";
import { EmptyValidator } from "@tai-kun/surrealdb/validators";
import { assertDeepEquals, assertJsonEquals } from "@tools/assert";
import { ready } from "@tools/surrealdb";
import { test } from "@tools/test";

class Formatter extends CborFormatter {
  constructor() {
    super({
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
    });
  }
}

const surreal = ready.then(async endpoint => {
  const { Surreal, ...rest } = initSurreal({
    Client,
    engines: {
      http: httpEngine,
    },
    Formatter,
    Validator: EmptyValidator,
  });

  return {
    ...rest,
    async connect() {
      const db = new Surreal();
      await db.connect(`http://${endpoint.host}`);

      return db;
    },
  };
});

test("JavaScript ネイティブ", async () => {
  const { connect, surql } = await surreal;
  await using db = await connect();
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
    assertDeepEquals(output, expected);
  }
  {
    const [output] = await db.query(surql`
      RETURN ${surql.raw(toSurql(input))}
    `);
    assertDeepEquals(output, expected);
  }
});

test("SurrealQL 独自の値", async () => {
  const { connect, surql } = await surreal;
  await using db = await connect();
  const input = {
    datetime: new Datetime([
      Date.UTC(2024, 6 - 1, 1, 12, 34, 56) / 1_000,
      123_456_789,
    ]),
    // decimal: new Decimal("3.1415926"),
    duration: new Duration("1y2w3d4h5m6s7ms8us9ns"),
    // geometries: new GeometryCollection([
    //   new GeometryPoint([1, "3.14"]),
    // ]),
    thing: new Thing(new Table("user"), { name: "tai-kun" }),
    uuidv1: new Uuid("ad7aea20-2c9b-11ef-9454-0242ac120002"),
    uuidv4: new Uuid("e1edeaeb-6413-469a-8e5f-cfbc085a5584"),
    uuidv7: new Uuid("019025ed-803c-7b9a-b0b0-cd884d7bb4fb"),
  };

  {
    const [output] = await db.query<[any]>(surql`
      RETURN ${input}
    `);
    assertJsonEquals(output, input);
  }
  {
    const [output] = await db.query<[any]>(surql`
      RETURN ${surql.raw(toSurql(input))}
    `);
    assertJsonEquals(output, input);
  }
});
