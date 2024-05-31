"use prelude";

import { SerialId } from "@tai-kun/surrealdb/internal";

test("should generate incremental IDs", () => {
  const id = new SerialId();

  assertEquals(id.next(), 1);
  assertEquals(id.next(), 2);
  assertEquals(id.next(), 3);
});

test("should reset the ID when it exceeds the maximum safe integer", () => {
  const OriginalNumber = Number;
  // @ts-expect-error
  Number = {
    MAX_SAFE_INTEGER: 3,
  };

  try {
    const id = new SerialId();

    assertEquals(id.next(), 1);
    assertEquals(id.next(), 2);
    assertEquals(id.next(), 3);
    assertEquals(id.next(), 1);
    assertEquals(id.next(), 2);
    assertEquals(id.next(), 3);
  } finally {
    Number = OriginalNumber;
  }
});
