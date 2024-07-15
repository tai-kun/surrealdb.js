import { SerialId } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("増分 ID を生成する", () => {
  const id = new SerialId();

  assert.equal(id.next(), 1);
  assert.equal(id.next(), 2);
  assert.equal(id.next(), 3);
});

test("ID が上限値を越えようとすると 1 にリセットされる", () => {
  const id = new SerialId(3);

  assert.equal(id.next(), 1);
  assert.equal(id.next(), 2);
  assert.equal(id.next(), 3);
  assert.equal(id.next(), 1);
  assert.equal(id.next(), 2);
  assert.equal(id.next(), 3);
});
