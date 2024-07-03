import { SerialId } from "@tai-kun/surreal/_lib";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("増分 ID を生成する", () => {
  const id = new SerialId();

  assert.equal(id.next(), 1);
  assert.equal(id.next(), 2);
  assert.equal(id.next(), 3);
});

test("ID が Number.MAX_SAFE_INTEGER を越えようとすると 1 にリセットされる", () => {
  const OriginalNumber = Number;
  // @ts-expect-error
  Number = {
    MAX_SAFE_INTEGER: 3,
  };

  try {
    const id = new SerialId();

    assert.equal(id.next(), 1);
    assert.equal(id.next(), 2);
    assert.equal(id.next(), 3);
    assert.equal(id.next(), 1);
    assert.equal(id.next(), 2);
    assert.equal(id.next(), 3);
  } finally {
    Number = OriginalNumber;
  }
});
