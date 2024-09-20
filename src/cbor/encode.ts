import { Memory } from "./_memory";
import { write, type WriteOptions } from "./write-utils";
import { Writer, type WriterOptions } from "./writer";

let mem: Memory;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/encode/#options)
 */
export interface EncodeOptions extends WriterOptions, WriteOptions {}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/encode/)
 */
export default function encode(
  value: unknown,
  options: EncodeOptions | undefined = {},
): Uint8Array {
  mem ||= new Memory();
  mem.define(0, 8192);

  try {
    const w = new Writer(mem.alloc(0), options);
    write(w, value, options);

    return w.output();
  } finally {
    mem.free(0);
  }
}
