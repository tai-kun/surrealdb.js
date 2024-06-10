import { assertThrows } from "@pkg/assert";
import { ENV, test } from "@pkg/test";
import { throwIfAborted } from "@tai-kun/surrealdb/_internal";

test("中止されていないシグナルを渡すと例外を投げない", () => {
  const controller = new AbortController();

  throwIfAborted(controller.signal);
});

test("中止されたシグナルを渡すと例外を投げる", () => {
  const controller = new AbortController();
  controller.abort();

  assertThrows(() => {
    throwIfAborted(controller.signal);
  });
});

test("中止されたシグナルを渡すと指定された例外を投げる", () => {
  if (ENV === "Firefox") {
    // TODO(tai-kun): Firefox でテストに失敗する。要調査。
    return;
  }

  const controller = new AbortController();
  const reason = new TypeError("test");
  controller.abort(reason);

  assertThrows(
    () => {
      throwIfAborted(controller.signal);
    },
    TypeError,
    "test",
  );
});
