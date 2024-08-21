import { channel } from "@tai-kun/surrealdb/utils";
import { expect, test, vi } from "vitest";

test("__DEV__ は true", () => {
  expect(__DEV__).toBe(true);
});

test("イベントを送受信できる", () => {
  const cb = vi.fn();

  channel.subscribe("foo", cb);

  channel.publish("foo", { data: "foo" });

  expect(cb.mock.calls).toStrictEqual([
    [{ data: "foo" }],
  ]);
});

test(": 区切りでイベントを送受信できる", () => {
  const cb = vi.fn();

  channel.subscribe("foo:bar:baz", cb);

  channel.publish("foo:bar:baz", { data: "foo:bar:baz" });

  expect(cb.mock.calls).toStrictEqual([
    [{ data: "foo:bar:baz" }],
  ]);
});

test("最後の * ワイルドカードでイベントを受信できる", () => {
  const cb = vi.fn();

  channel.subscribe("foo:bar:*", cb);

  channel.publish("foo:bar", { data: "foo:bar" });
  channel.publish("foo:baz:1", { data: "foo:baz:1" });

  channel.publish("foo:bar:1", { data: "foo:bar:1" });
  channel.publish("foo:bar:2", { data: "foo:bar:2" });

  expect(cb.mock.calls).toStrictEqual([
    [{ data: "foo:bar:1" }],
    [{ data: "foo:bar:2" }],
  ]);
});

test("最初の * ワイルドカードでイベントを受信できる", () => {
  const cb = vi.fn();

  channel.subscribe("*:bar:baz", cb);

  channel.publish("foo:bar", { data: "foo:bar" });
  channel.publish("foo:baz:1", { data: "foo:baz:1" });

  channel.publish("foo:bar:baz", { data: "foo:bar:baz" });
  channel.publish("bar:bar:baz", { data: "bar:bar:baz" });
  channel.publish("baz:bar:baz", { data: "baz:bar:baz" });

  expect(cb.mock.calls).toStrictEqual([
    [{ data: "foo:bar:baz" }],
    [{ data: "bar:bar:baz" }],
    [{ data: "baz:bar:baz" }],
  ]);
});

test("途中の * ワイルドカードでイベントを受信できる", () => {
  const cb = vi.fn();

  channel.subscribe("foo:*:baz", cb);

  channel.publish("foo:bar", { data: "foo:bar" });
  channel.publish("foo:baz:1", { data: "foo:baz:1" });
  channel.publish("bar:bar:baz", { data: "bar:bar:baz" });
  channel.publish("baz:bar:baz", { data: "baz:bar:baz" });
  channel.publish("foo:bar:baz:1", { data: "foo:bar:baz:1" });

  channel.publish("foo:bar:baz", { data: "foo:bar:baz" });

  expect(cb.mock.calls).toStrictEqual([
    [{ data: "foo:bar:baz" }],
  ]);
});

test("最後の * ワイルドカードは : 区切りを無視する", () => {
  const cb = vi.fn();

  channel.subscribe("foo:*", cb);

  channel.publish("foo:bar", { data: "foo:bar" });
  channel.publish("foo:bar:baz", { data: "foo:bar:baz" });

  expect(cb.mock.calls).toStrictEqual([
    [{ data: "foo:bar" }],
    [{ data: "foo:bar:baz" }],
  ]);
});

test("イベントの受信をやめる", () => {
  const cb = vi.fn();

  const unsubscribe = channel.subscribe("foo", cb);

  channel.publish("foo", { data: 1 });
  channel.publish("foo", { data: 2 });

  unsubscribe();

  channel.publish("foo", { data: 3 });
  channel.publish("foo", { data: 4 });

  expect(cb.mock.calls).toStrictEqual([
    [{ data: 1 }],
    [{ data: 2 }],
  ]);
});
