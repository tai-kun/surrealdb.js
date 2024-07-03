import { makeAbortApi } from "@tai-kun/surreal/_lib";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("AbortSignal オブジェクトと中止関数を返す", () => {
  const [signal, abort] = makeAbortApi();

  assert(signal instanceof AbortSignal);
  assert(abort instanceof Function);
  assert.equal(signal.aborted, false);
});

test("シグナルがすでに中断を示していたらエラーを投げる", () => {
  const ac = new AbortController();
  ac.abort();

  assert.throws(
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

  assert.equal(signal.aborted, true);
  assert.equal(signal.reason, reason);
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

  assert.notEqual(signal, ac.signal);
  assert.equal(signal.aborted, true);
  assert.equal(signal.reason, reason);
  assert.equal(aborted, true);
});
