import { getTimeoutSignal } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("AbortSignal を返す", () => {
  const signal = getTimeoutSignal(1);

  assert(signal instanceof AbortSignal);
});

test("指定時間経過後に中止される", async () => {
  // Node.js 18 では、イベントリスナーを登録してもタイムアウトが発生せず、イベントループが終了する。
  // イベントループを終了させないために、シグナルの中止フラグが立つまで待機する。

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const signal = getTimeoutSignal(1);

  while (!signal.aborted) {
    await sleep(100);
  }

  assert(signal.reason instanceof DOMException);
});
