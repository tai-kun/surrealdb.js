import { Future } from "@tai-kun/surrealdb/data-types/standard";
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
  const a = "foo";
  const b = "bar";
  const f = new Future("time::now()");
  f.block = Future.surql`
    LET $a = ${a} + ${Future.raw("'-'")};
    LET $b = ${b};
    string::concat($a, $b)
  `;

  expect(f.toSurql()).toBe(`<future>{
    LET $a = 'foo' + '-';
    LET $b = 'bar';
    string::concat($a, $b)
  }`);
});
