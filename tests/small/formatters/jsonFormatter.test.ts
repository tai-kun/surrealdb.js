import formatter, { clone, Payload } from "@tai-kun/surreal/formatters/json";
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

test("データを複製できる", async () => {
  const data = { hello: "world" };
  const copied = await clone(formatter, data);

  assert.notEqual(copied, data);
  assert.deepEqual(copied, data);
});
