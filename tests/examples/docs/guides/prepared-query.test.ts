import { surql, Surreal, Thing } from "@tai-kun/surrealdb";
import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod";
import { host } from "../../surreal";

test("基本的な使い方", async () => {
  // prepare
  {
  }

  const CreateUserQuery = surql`CREATE ONLY user:foo CONTENT { age: 42 };`
    .returns<[{ id: Thing<"user">; age: number }]>();

  await using db = new Surreal();
  await db.connect(`ws://${host()}`);
  await db.signin({ user: "root", pass: "root" });
  await db.use("example", "example");

  const results = await db.query(CreateUserQuery);
  //    ^?

  // tests
  {
    expectTypeOf<typeof results>().toEqualTypeOf<[{
      id: Thing<"user">;
      age: number;
    }]>();
    expect(results).toStrictEqual([{
      id: new Thing("user", "foo"),
      age: 42,
    }]);
  }
});

test("クエリーの結果を検証する", async () => {
  // prepare
  {
  }

  const isUserTable = (id: Thing): id is Thing<"user"> => id.tb === "user";

  const CreatedUserSchema = z.tuple([
    z.object({
      id: z.instanceof(Thing).refine(isUserTable),
      age: z.number(),
    }),
  ]);

  const CreateUserQuery = surql`CREATE ONLY user:bar CONTENT { age: 42 };`
    .returns(CreatedUserSchema.parse.bind(CreatedUserSchema));

  await using db = new Surreal();
  await db.connect(`ws://${host()}`);
  await db.signin({ user: "root", pass: "root" });
  await db.use("example", "example");

  const results = await db.query(CreateUserQuery);
  //    ^?

  // tests
  {
    expectTypeOf<typeof results>().toEqualTypeOf<[{
      id: Thing<"user">;
      age: number;
    }]>();
    expect(results).toStrictEqual([{
      id: new Thing("user", "bar"),
      age: 42,
    }]);
  }
});

test("クエリーに変数を埋め込む", async () => {
  // prepare
  {
  }

  const USERNAME = "baz";
  const USER_AGE = 42;

  const CreateUserQuery = surql`
    CREATE ONLY type::thing('user', ${USERNAME}) CONTENT { age: ${USER_AGE} };`
    .returns<[{ id: Thing<"user">; age: number }]>();

  await using db = new Surreal();
  await db.connect(`ws://${host()}`);
  await db.signin({ user: "root", pass: "root" });
  await db.use("example", "example");

  const results = await db.query(CreateUserQuery);
  //    ^?

  // tests
  {
    expectTypeOf<typeof results>().toEqualTypeOf<[{
      id: Thing<"user">;
      age: number;
    }]>();
    expect(results).toStrictEqual([{
      id: new Thing("user", "baz"),
      age: 42,
    }]);
  }
});

test("クエリーに引数を定義する", async () => {
  // prepare
  {
  }

  const isUserTable = (id: Thing): id is Thing<"user"> => id.tb === "user";

  const UserIdSchema = z.instanceof(Thing).refine(isUserTable);

  const UserIdSlot = surql.slot("id")
    .type(UserIdSchema.parse.bind(UserIdSchema));

  const UserAgeSlot = surql.slot("age", 42);

  const CreateUserQuery = surql`
    CREATE ONLY ${UserIdSlot} CONTENT { age: ${UserAgeSlot} };`
    .returns<[{ id: Thing<"user">; age: number }]>();

  await using db = new Surreal();
  await db.connect(`ws://${host()}`);
  await db.signin({ user: "root", pass: "root" });
  await db.use("example", "example");

  const results = await db.query(CreateUserQuery, {
    id: new Thing("user", "tai-kun"),
  });

  // tests
  {
    expectTypeOf<typeof results>().toEqualTypeOf<[{
      id: Thing<"user">;
      age: number;
    }]>();
    expect(results).toStrictEqual([{
      id: new Thing("user", "tai-kun"),
      age: 42,
    }]);
  }
});
