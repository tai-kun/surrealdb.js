import { MAX_SAFE_INT } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("安全な整数値", async () => {
  assert.equal(Number.MAX_SAFE_INTEGER, MAX_SAFE_INT);
});
