import { write } from "./write-utils";
import Writer, { type WriterOptions } from "./Writer";

export interface EncodeOptions extends WriterOptions {}

export default function encode(
  value: unknown,
  options: EncodeOptions | undefined = {},
): Uint8Array {
  const w = new Writer(options);
  write(w, value);

  return w.consume();
}
