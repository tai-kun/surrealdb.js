import Decoder, { type DecoderOptions } from "./decoder";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/decode/#options)
 */
export interface DecodeOptions extends DecoderOptions {}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/decode/)
 */
export default function decode(
  input: Uint8Array,
  options?: DecodeOptions | undefined,
): unknown {
  const decoder = new Decoder(options);
  decoder.process(input);

  return decoder.output();
}
