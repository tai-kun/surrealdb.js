import {
  BoundExcluded,
  BoundIncluded,
  Range,
} from "@tai-kun/surrealdb/data-types/standard";
import { describe, expect, test } from "vitest";

test(".begin, .end", () => {
  const r = new Range([new BoundIncluded(1), new BoundExcluded(3)]);

  expect(r.begin).toBeInstanceOf(BoundIncluded);
  expect(r.end).toBeInstanceOf(BoundExcluded);
});

describe(".toSurql()", () => {
  test.for<[BoundIncluded | null, BoundExcluded | null, string]>([
    [new BoundIncluded(1), new BoundExcluded(3), "1..3"],
    [new BoundIncluded(1), null, "1.."],
    [null, new BoundExcluded(3), "..3"],
    [null, null, ".."],
  ])("begin=%s ~ end=%s -> %s", ([begin, end, surql]) => {
    const r = new Range([begin, end]);

    expect(r.toSurql()).toBe(surql);
  });
});
