import { Serial } from "@tai-kun/surreal/utils";
import { describe, expect, test, vi } from "vitest";

test("増分 ID を生成する", () => {
  const id = new Serial();

  expect(id.next()).toBe(1);
  expect(id.next()).toBe(2);
  expect(id.next()).toBe(3);
});

test("ID が上限値を越えようとすると 1 にリセットされる", () => {
  const id = new Serial(3);

  expect(id.next()).toBe(1);
  expect(id.next()).toBe(2);
  expect(id.next()).toBe(3);
  expect(id.next()).toBe(1);
  expect(id.next()).toBe(2);
  expect(id.next()).toBe(3);
});

describe("ドキュメントの例", () => {
  test("基本的な使い方", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        const id = new Serial(3);

        console.log(id.next());
        console.log(id.next());
        console.log(id.next());

        console.log(id.next());
        console.log(id.next());

        id.reset();

        console.log(id.next());
        console.log(id.next());
      }

      // Test
      {
        expect(spy.mock.calls).toStrictEqual([
          [1],
          [2],
          [3],
          [1],
          [2],
          [1],
          [2],
        ]);
      }
    } finally {
      spy.mockClear();
    }
  });
});
