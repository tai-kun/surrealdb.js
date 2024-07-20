import Decoder, { type DecoderOptions } from "./Decoder";
import Parser, { type ParserOptions } from "./Parser";

export interface DecodeOptions extends ParserOptions, DecoderOptions {}

export default function decode(
  input: Uint8Array,
  options?: DecodeOptions | undefined,
): unknown {
  const parser = new Parser(options);
  const decoder = new Decoder(options);

  for (const dataItem of parser.stream(input)) {
    decoder.process(dataItem);
  }

  const out = decoder.end();
  parser.end();

  return out;
}
