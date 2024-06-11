import { SerialId } from "@tai-kun/surrealdb/_internal";
import { assertEquals } from "@tools/assert";
import { test } from "@tools/test";

test("増分 ID を生成する", () => {
  const id = new SerialId();

  assertEquals(id.next(), 1);
  assertEquals(id.next(), 2);
  assertEquals(id.next(), 3);
});

test("ID が Number.MAX_SAFE_INTEGER を越えようとすると 1 にリセットされる", () => {
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
