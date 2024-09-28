import {
  BoundExcluded,
  BoundIncluded,
  Range,
} from "@tai-kun/surrealdb/data-types/standard";
import { describe, expect, test } from "vitest";

type Bound = BoundIncluded | BoundExcluded;

test(".begin, .end", () => {
  const r = new Range([new BoundIncluded(1), new BoundExcluded(3)]);

  expect(r.begin).toBeInstanceOf(BoundIncluded);
  expect(r.end).toBeInstanceOf(BoundExcluded);
});

describe(".toSurql()", () => {
  // dprint-ignore
  const tests: [Bound | null, Bound | null, string][] = [
    [ new BoundIncluded(1), new BoundIncluded(3), "1..=3"  ],
    [ new BoundExcluded(1), new BoundExcluded(3), "1>..3"  ],

    [ new BoundIncluded(1), new BoundExcluded(3), "1..3"   ],
    [ new BoundIncluded(1),                 null, "1.."    ],
    [                 null, new BoundExcluded(3), "..3"    ],

    [ new BoundExcluded(1), new BoundIncluded(3), "1>..=3" ],
    [ new BoundExcluded(1),                 null, "1>.."   ],
    [                 null, new BoundIncluded(3), "..=3"   ],

    [                 null,                 null, ".."     ],
  ];

  for (const [beg, end, surql] of tests) {
    test(`beg=${String(beg).padEnd(4, " ")} ~ end=${String(end).padEnd(4, " ")} -> ${surql}`, () => {
      const r = new Range([beg, end]);

      expect(r.toSurql()).toBe(surql);
    });
  }
});

describe(".clone()", () => {
  class MyRange extends Range {}
  class MyBoundIncluded extends BoundIncluded {}
  class MyBoundExcluded extends BoundExcluded {}

  test(".begin, .end", () => {
    const object = new MyRange([
      new MyBoundIncluded(1),
      new MyBoundExcluded(3),
    ]);
    const cloned = object.clone();

    expect(cloned).not.toBe(object);
    expect(cloned).toBeInstanceOf(MyRange);
    expect(cloned.end).toBeInstanceOf(MyBoundExcluded);
    expect(cloned.begin).toBeInstanceOf(MyBoundIncluded);
    expect(cloned).toStrictEqual(object);
  });

  // dprint-ignore
  const tests: [Bound | null, Bound | null][] = [
    [ new MyBoundIncluded(1), new MyBoundIncluded(3) ],
    [ new MyBoundExcluded(1), new MyBoundExcluded(3) ],

    [ new MyBoundIncluded(1), new MyBoundExcluded(3) ],
    [ new MyBoundIncluded(1),                   null ],
    [                   null, new MyBoundExcluded(3) ],

    [ new MyBoundExcluded(1), new MyBoundIncluded(3) ],
    [ new MyBoundExcluded(1),                   null ],
    [                   null, new MyBoundIncluded(3) ],

    [                   null,                   null ],
  ];

  for (const [beg, end] of tests) {
    test(`beg=${String(beg).padEnd(4, " ")} ~ end=${String(end).padEnd(4, " ")}`, () => {
      const object = new MyRange([beg, end]);
      const cloned = object.clone();

      expect(cloned).not.toBe(object);
      expect(cloned).toBeInstanceOf(MyRange);
      expect(cloned).toStrictEqual(object);
    });
  }
});
