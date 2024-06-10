import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
  assertThrows,
} from "@pkg/assert";
import { test } from "@pkg/test";
import { makeAbortApi } from "@tai-kun/surrealdb/_internal";

test("AbortSignal オブジェクトと中止関数を返す", () => {
  const [signal, abort] = makeAbortApi();

  assertInstanceOf(signal, AbortSignal);
  assertInstanceOf(abort, Function);
  assertEquals(signal.aborted, false);
});

test("シグナルがすでに中断を示していたらエラーを投げる", () => {
  const ac = new AbortController();
  ac.abort();

  assertThrows(
    () => {
      makeAbortApi(ac.signal);
    },
    "The operation was aborted",
  );
});

test("中止する", async () => {
  const [signal, abort] = makeAbortApi();
  const reason = {};
  abort(reason);

  assertEquals(signal.aborted, true);
  assertEquals(signal.reason, reason);
});

test("オプションのシグナルに中止の情報を伝播する", async () => {
  const ac = new AbortController();
  const [signal] = makeAbortApi(ac.signal);
  let aborted = false;
  signal.addEventListener("abort", () => {
    aborted = true;
  });
  const reason = {};
  ac.abort(reason);

  assertNotEquals(signal, ac.signal);
  assertEquals(signal.aborted, true);
  assertEquals(signal.reason, reason);
  assertEquals(aborted, true);
});
