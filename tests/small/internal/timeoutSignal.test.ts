import { assertInstanceOf } from "@tools/assert";
import { test } from "@tools/test";
import { timeoutSignal } from "surrealjs/_internal";

test("AbortSignal を返す", () => {
  const signal = timeoutSignal(1);

  assertInstanceOf(signal, AbortSignal);
});

test("指定時間経過後に中止される", async () => {
  // Node.js 18 では、イベントリスナーを登録してもタイムアウトが発生せず、イベントループが終了する。
  // イベントループを終了させないために、シグナルの中止フラグが立つまで待機する。

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const signal = timeoutSignal(1);

  while (!signal.aborted) {
    await sleep(100);
  }

  assertInstanceOf(signal.reason, DOMException);
});
