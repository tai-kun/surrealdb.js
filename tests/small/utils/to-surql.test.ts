import { toSurql } from "@tai-kun/surrealdb/utils";
import { expect, test, vi } from "vitest";

test("ドキュメントの例", async () => {
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});

  try {
    // Example code
    {
      const surql = toSurql({
        bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
        boolean: [true, false],
        date: new Date("2024-06-01T12:34:56.789Z"),
        map: new Map([
          [0, {
            toJSON: () => [0, 1],
          }],
        ]),
        null: null,
        number: 123,
        set: new Set([{
          toSurql: () => `<bytes>"hello"`,
        }]),
        string: "文字列",
        undefined: undefined,
      });

      console.log(surql);
    }

    // Test
    {
      await vi.waitUntil(() => spy.mock.calls.length === 1);
      // dprint-ignore
      expect(spy.mock.calls).toStrictEqual([[
        `{` +
        `bigint:9007199254740992,` +
        `boolean:[true,false],` +
        `date:d'2024-06-01T12:34:56.789Z',` +
        `map:{0:[0,1]},` +
        `null:NULL,` +
        `number:123,` +
        `set:[<bytes>"hello"],` +
        `string:'文字列',` +
        `undefined:NONE` +
        `}`,
      ]]);
    }
  } finally {
    // Clean up

    spy.mockClear();
  }
});
