import { Decoder, type DecoderOptions } from "./decoder";
import { Lexer, type LexerOptions } from "./lexer";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/formatters/cbor/decode/#options)
 */
export interface DecodeOptions extends LexerOptions, DecoderOptions {}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/formatters/cbor/decode/)
 */
export default function decode(
  input: Uint8Array,
  options?: DecodeOptions | undefined,
): unknown {
  const lexer = new Lexer(options);
  const decoder = new Decoder(options);

  for (const dataItem of lexer.stream(input)) {
    decoder.process(dataItem);
  }

  const out = decoder.end();
  lexer.end();

  return out;
}
