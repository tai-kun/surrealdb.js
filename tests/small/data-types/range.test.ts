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
