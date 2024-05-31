"use prelude";

import { DataConversionFailure, RpcResponseData } from "@tai-kun/surrealdb";

test("should decode the response data as a UTF-8 string", async () => {
  let arrayBufferCallCount = 0;
  const rawData = {
    arrayBuffer: async () => {
      arrayBufferCallCount++;
      const str = "Hello";
      const encoder = new TextEncoder();
      return encoder.encode(str).buffer;
    },
  };
  const data = new RpcResponseData(rawData);

  assertEquals(await data.text(), "Hello");
  assertEquals(await data.text(), "Hello");
  assertEquals(arrayBufferCallCount, 1);
});

test("should throw an error if the response data is not an ArrayBuffer", async () => {
  const rawData = {};
  const data = new RpcResponseData(
    // @ts-expect-error
    rawData,
  );

  await assertRejects(
    async () => {
      await data.arrayBuffer();
    },
    DataConversionFailure,
    "Failed to convert the data from RpcResponseRawData to ArrayBuffer",
  );
});
