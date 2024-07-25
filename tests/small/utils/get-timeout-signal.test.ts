import { getTimeoutSignal } from "@tai-kun/surreal/utils";
import { expect, test, vi } from "vitest";

test("指定時間経過後に中止される", async () => {
  const signal = getTimeoutSignal(1);

  expect(signal).toBeInstanceOf(AbortSignal);

  await vi.waitUntil(() => signal.aborted);

  expect(signal.reason).toBeInstanceOf(DOMException);
});
