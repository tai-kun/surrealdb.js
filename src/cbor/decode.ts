import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import { _Decoder, type DecoderOptions } from "./decoder";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/decode/#options)
 */
export interface DecodeOptions extends DecoderOptions {}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/decode/)
 */
export default function decode(
  input: Uint8ArrayLike,
  options?: DecodeOptions | undefined,
): unknown {
  const decoder = new _Decoder(options);
  decoder.process(input);

  return decoder.output();
}
