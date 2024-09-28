import { Future, Thing } from "@tai-kun/surrealdb/data-types/standard";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test(".block", () => {
  const f = new Future("time::now()");

  expect(f.block).toBe("time::now()");
});

test(".toString()", () => {
  const f = new Future("time::now()");

  expect(f.toString()).toBe("time::now()");
});

test(".toJSON()", () => {
  const f = new Future("time::now()");

  expect(f.toJSON()).toBe("time::now()");
});

test(".toSurql()", () => {
  const f = new Future("time::now()");

  expect(f.toSurql()).toBe("<future>{time::now()}");
});

test(".toPlainObject()", () => {
  const f = new Future("time::now()");

  expect(f.toPlainObject()).toStrictEqual({
    block: "time::now()",
  });
});

test(".surql()", () => {
  const foo = "foo";
  const rid = new Thing("person", "tai-kun");
  const future = new Future(Future.surql`
    LET $a = ${foo} + ${Future.raw("'-'")};
    LET $b = type::string(${rid});
    string::concat($a, $b)
  `);

  expect(future.toSurql()).toBe(`<future>{
    LET $a = 'foo' + '-';
    LET $b = type::string(r'person:⟨tai-kun⟩');
    string::concat($a, $b)
  }`);
});

test(".surql() なし", () => {
  const foo = "foo";
  const rid = new Thing("person", "tai-kun");
  const future = new Future(/*surql*/ `
    LET $a = ${toSurql(foo)} + ${"'-'"};
    LET $b = type::string(${rid.toSurql()});
    string::concat($a, $b)
  `);

  expect(future.toSurql()).toBe(`<future>{
    LET $a = 'foo' + '-';
    LET $b = type::string(r'person:⟨tai-kun⟩');
    string::concat($a, $b)
  }`);
});

test(".clone()", () => {
  class MyFuture extends Future {}

  const object = new MyFuture("time::now()");
  const cloned = object.clone();

  expect(cloned).not.toBe(object);
  expect(cloned).toBeInstanceOf(MyFuture);
  expect(cloned).toStrictEqual(object);
});
