import { write, type WriteOptions } from "./write-utils";
import { Writer, type WriterOptions } from "./writer";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/encode/#options)
 */
export interface EncodeOptions extends WriterOptions, WriteOptions {}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/encode/)
 */
export default function encode(
  value: unknown,
  options: EncodeOptions | undefined = {},
): Uint8Array {
  const w = new Writer(options);
  write(w, value, options);

  return w.output();
}
