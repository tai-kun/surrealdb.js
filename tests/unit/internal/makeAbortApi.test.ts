"use prelude";

import { makeAbortApi } from "@tai-kun/surrealdb/internal";

test("should return the AbortSignal object and the abort function", () => {
  const [signal, abort] = makeAbortApi();

  assertInstanceOf(signal, AbortSignal);
  assertInstanceOf(abort, Function);
  assertEquals(signal.aborted, false);
});

test("should throw if the signal is already aborted", () => {
  const ac = new AbortController();
  ac.abort();

  assertThrows(
    () => {
      makeAbortApi(ac.signal);
    },
    "The operation was aborted",
  );
});

test("should abort the signal", async () => {
  const [signal, abort] = makeAbortApi();
  const reason = {};
  abort(reason);

  assertEquals(signal.aborted, true);
  assertEquals(signal.reason, reason);
});

test("should forward the abort signal", async () => {
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
