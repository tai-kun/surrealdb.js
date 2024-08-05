import { CborDecodeStreamAbortFailedError } from "@tai-kun/surrealdb/errors";
import { StatefulPromise, throwIfAborted } from "@tai-kun/surrealdb/utils";
import { Decoder, type DecoderOptions } from "./decoder";
import { Lexer, type LexerOptions } from "./lexer";

export interface DecodeStreamOptions extends LexerOptions, DecoderOptions {
  readonly signal?: AbortSignal | undefined;
}

export default function decodeStream(
  input: ReadableStream<Uint8Array>,
  options: DecodeStreamOptions | undefined = {},
): StatefulPromise<unknown> {
  return StatefulPromise.try(async () => {
    const { signal } = options;
    throwIfAborted(signal);

    const lexer = new Lexer(options);
    const decoder = new Decoder(options);
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
          for (const dataItem of lexer.stream(value)) {
            decoder.process(dataItem);
          }
        }

        if (done) {
          break;
        }
      }

      if (cancelPromise) {
        throw await cancelPromise;
      }

      const out = decoder.end();
      lexer.end();

      return out;
    } finally {
      signal?.removeEventListener("abort", handleAbort);
    }
  });
}
