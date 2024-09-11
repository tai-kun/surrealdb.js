import { CborDecodeStreamAbortFailedError } from "@tai-kun/surrealdb/errors";
import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import { StatefulPromise, throwIfAborted } from "@tai-kun/surrealdb/utils";
import { _Decoder, type DecoderOptions } from "./decoder";

export interface DecodeStreamOptions extends DecoderOptions {
  readonly signal?: AbortSignal | undefined;
}

export default function decodeStream(
  input: ReadableStream<Uint8ArrayLike>,
  options: DecodeStreamOptions | undefined = {},
): StatefulPromise<unknown> {
  return StatefulPromise.try(async () => {
    const { signal } = options;
    throwIfAborted(signal);

    const decoder = new _Decoder(options);
    let cancelPromise: Promise<unknown> | undefined;

    function handleAbort(this: AbortSignal): void {
      cancelPromise = reader.cancel(this.reason).then(
        () => this.reason,
        e => new CborDecodeStreamAbortFailedError([this.reason, e]),
      );
    }

    const reader = input.getReader();
    signal?.addEventListener("abort", handleAbort, { once: true });

    try {
      // TODO(tai-kun): reader.releaseLock() の使い方がよく分からない。finaly 内 で実行
      // すると .read() がすべて終わってからの解除だから「TypeError: Invalid state: Reader
      // released」が必ず発生する。つまりここでは解除しなくて良い？
      while (true) {
        const { done, value } = await reader.read();

        if (value) {
          decoder.process(value);
        }

        if (done) {
          break;
        }
      }

      if (cancelPromise) {
        throw await cancelPromise;
      }

      return decoder.output();
    } finally {
      signal?.removeEventListener("abort", handleAbort);
    }
  });
}
