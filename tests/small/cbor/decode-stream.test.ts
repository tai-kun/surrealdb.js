import { decodeStream } from "@tai-kun/surrealdb/cbor";
import { expect, test, vi } from "vitest";

test("チャンクを跨いで固定長配列をデコードできる", async () => {
  const chunk1 = [
    0x83, // mt: 4, ai: 3
    0x01, // mt: 0, ai: 1
  ];
  const chunk2 = [
    0x02, // mt: 0, ai: 2
    0x03, // mt: 0, ai: 3
  ];
  const chunks = [chunk1, chunk2];
  const result = await decodeStream(
    new ReadableStream({
      pull(c) {
        const chunk = chunks.shift();

        if (chunk) {
          c.enqueue(new Uint8Array(chunk));
        } else {
          c.close();
        }
      },
    }),
  );

  expect(result).toStrictEqual([
    1,
    2,
    3,
  ]);
});

test("チャンクを跨いで固定長 UTF-8 文字列をデコードできる", async () => {
  const chunk1 = [
    0x65, // mt: 3, ai: 5
    0x68, // h
    0x65, // e
  ];
  const chunk2 = [
    0x6C, // l
  ];
  const chunk3 = [
    0x6C, // l
    0x6F, // o
  ];
  const chunks = [chunk1, chunk2, chunk3];
  const result = await decodeStream(
    new ReadableStream({
      pull(c) {
        const chunk = chunks.shift();

        if (chunk) {
          c.enqueue(new Uint8Array(chunk));
        } else {
          c.close();
        }
      },
    }),
  );

  expect(result).toBe("hello");
});

test("デコードを中断できる", async () => {
  const promise = new Promise(async (resolve, reject) => {
    const ac = new AbortController();
    let pull = false;

    decodeStream(
      new ReadableStream({
        pull: (): PromiseLike<void> => ({
          then(): any {
            pull = true;
          },
        }),
      }),
      {
        signal: ac.signal,
      },
    ).then(
      resolve,
      reject,
    );

    await vi.waitFor(() => pull);
    ac.abort("Aborted by signal");
  });

  await expect(promise).rejects.toThrow("Aborted by signal");
});
