import { makeAbortApi } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("AbortSignal オブジェクトと関数を返す", () => {
  const [signal, abort] = makeAbortApi();

  assert(
    signal instanceof AbortSignal,
    "signal は AbortSignal のインスタンスであるべきです。",
  );
  assert(abort instanceof Function, "abort は関数であるべきです。");
  assert.equal(
    signal.aborted,
    false,
    "中止する関数を呼び出す前の中止フラグは false であるべきです。",
  );
  assert.equal(
    signal.reason,
    undefined,
    "中止する関数を呼び出す前は中止の理由が未設定であるべきです。",
  );
});

test("シグナルがすでに中断を示していたら例外を投げる", () => {
  const ac = new AbortController();
  const error = new Error("test");
  ac.abort(error);

  assert.throws(
    () => {
      makeAbortApi(ac.signal);
    },
    error,
  );
});

test("中止する", async () => {
  const [signal, abort] = makeAbortApi();
  const reason = {};
  abort(reason);

  assert.equal(
    signal.aborted,
    true,
    "中止する関数を呼び出した後の中止フラグは true であるべきです",
  );
  assert.equal(signal.reason, reason, "中止の理由が設定されるべきです。");
});

test("複数回中止した場合は最初の 1 回だけ実行される", () => {
  const [signal, abort] = makeAbortApi();
  abort({});
  const reason = {};
  abort(reason);

  assert.notEqual(signal.reason, reason);
});

test("オプションのシグナルに中止の情報を伝播する", async () => {
  const ac = new AbortController();
  const [signal] = makeAbortApi(ac.signal);
  const reason = {};
  ac.abort(reason);

  assert.notEqual(
    signal,
    ac.signal,
    "中止シグナルが新しく作成されるべきです。",
  );
  assert.equal(
    signal.aborted,
    true,
    "オプションのシグナルが中止イベントを受け取ったら、"
      + "新しく作成されたシグナルも中止フラグが true になるべきです。",
  );
  assert.equal(signal.reason, reason, "中止の理由を伝播するべきです。");
});
