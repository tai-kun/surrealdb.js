import { DataFormatError } from "@tai-kun/surreal/errors";
import { Payload } from "@tai-kun/surreal/formatters";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("参照にアクセスできる", () => {
  const data = {};
  const paylaod = new Payload(data);

  assert.equal(paylaod.raw, data);
});

test("文字列から文字列に変換できる", async () => {
  const data = "Hello, world!";
  const paylaod = new Payload(data);

  assert.deepEqual(await paylaod.text(), data);
});

test("ArrayBuffer から文字列に変換できる", async () => {
  const data = new TextEncoder().encode("Hello, world!").buffer;
  const paylaod = new Payload(data);

  assert.deepEqual(await paylaod.text(), "Hello, world!");
});

test("文字列から ArrayBuffer に変換できる", async () => {
  const data = "Hello, world!";
  const paylaod = new Payload(data);

  assert.deepEqual(
    await paylaod.arrayBuffer(),
    new TextEncoder().encode(data).buffer,
  );
});

test("ArrayBuffer から ArrayBuffer に変換できる", async () => {
  const data = new TextEncoder().encode("Hello, world!").buffer;
  const paylaod = new Payload(data);

  assert.deepEqual(await paylaod.arrayBuffer(), data);
});

test("一度変換に成功したら、キャッシュされる", async () => {
  const data = "Hello, world!";
  const paylaod = new Payload(data);

  assert.equal(
    await paylaod.arrayBuffer(),
    await paylaod.arrayBuffer(),
  );
});

test("ArrayBuffer にできない場合はエラーを投げる", async () => {
  const data = {};
  const paylaod = new Payload(data);

  await assert.rejects(
    async () => await paylaod.arrayBuffer(),
    DataFormatError,
  );
});
