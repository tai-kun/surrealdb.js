import { throwIfAborted } from "@tai-kun/surreal/utils";
import { expect, test } from "vitest";

test("中止されていないシグナルを渡すと例外を投げない", () => {
  const controller = new AbortController();
  const fn = () => {
    throwIfAborted(controller.signal);
  };

  expect(fn).not.toThrow();
});

test("中止されたシグナルを渡すと例外を投げる", () => {
  const controller = new AbortController();
  const fn = () => {
    throwIfAborted(controller.signal);
  };
  controller.abort(new Error("test"));

  expect(fn).toThrowError("test");
});
