import { throwIfAborted } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test("中止されていないシグナルを渡すと例外を投げない", () => {
  const controller = new AbortController();
  const fn = () => {
    throwIfAborted(controller.signal);
  };

  expect(fn).not.toThrowError();
});

test("中止されたシグナルを渡すと例外を投げる", () => {
  const controller = new AbortController();
  const fn = () => {
    throwIfAborted(controller.signal);
  };
  controller.abort(new Error("test"));

  expect(fn).toThrowErrorMatchingSnapshot();
});
