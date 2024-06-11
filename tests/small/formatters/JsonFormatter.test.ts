import {
  FormatterAbc,
  JsonFormatter,
  Payload,
} from "@tai-kun/surrealdb/formatters";
import {
  assertDeepEquals,
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
} from "@tools/assert";
import { test } from "@tools/test";

test("抽象クラスを拡張している", () => {
  assertInstanceOf(new JsonFormatter(), FormatterAbc);
});

test("JSON 文字列にエンコードできる", () => {
  const formatter = new JsonFormatter();
  const data = { hello: "world" };

  assertEquals(formatter.encode(data), "{\"hello\":\"world\"}");
});

test("JSON 文字列をデコードできる", async () => {
  const formatter = new JsonFormatter();
  const data = "{\"hello\":\"world\"}";
  const payload = new Payload(data);

  assertDeepEquals(await formatter.decode(payload), { hello: "world" });
});

test("データをコピーできる", async () => {
  const formatter = new JsonFormatter();
  const data = { hello: "world" };
  const copied = await formatter.copy(data);

  assertNotEquals(copied, data);
  assertDeepEquals(copied, data);
});
