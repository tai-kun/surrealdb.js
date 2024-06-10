import { assertInstanceOf, assertRejects } from "@pkg/assert";
import { test } from "@pkg/test";
import { timeoutSignal } from "@tai-kun/surrealdb/_internal";

test("AbortSignal を返す", () => {
  const signal = timeoutSignal(1);

  assertInstanceOf(signal, AbortSignal);
});

test("指定時間経過後に中止される", async () => {
  const signal = timeoutSignal(1);

  await assertRejects(
    () =>
      new Promise<unknown>((_, reject) => {
        signal.onabort = () => reject(signal.reason);
      }),
    DOMException,
  );
});
