import {
  copy,
  jsonFormatter as formatter,
  Payload,
} from "@tai-kun/surreal/formatters";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("JSON 文字列にエンコードできる", () => {
  const data = { hello: "world" };

  assert.equal(formatter.encode(data), "{\"hello\":\"world\"}");
});

test("JSON 文字列をデコードできる", async () => {
  const data = "{\"hello\":\"world\"}";
  const payload = new Payload(data);

  assert.deepEqual(await formatter.decode(payload), { hello: "world" });
});

test("データをコピーできる", async () => {
  const data = { hello: "world" };
  const copied = await copy(formatter, data);

  assert.notEqual(copied, data);
  assert.deepEqual(copied, data);
});
