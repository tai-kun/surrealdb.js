export default {
  // 戦闘を空白にすると入力補完の候補から排除される。
  [" e"]: /* @__PURE__ */ new TextEncoder(),
  [" d"]: /* @__PURE__ */ new TextDecoder("utf-8", {
    // 文字列のデコードパフォーマンスは落ちるが、より厳格になる。
    fatal: true,
    ignoreBOM: true,
  }),
  encode(input: string): Uint8Array {
    return this[" e"].encode(input);
  },
  encodeInto(input: string, dest: Uint8Array): TextEncoderEncodeIntoResult {
    return this[" e"].encodeInto(input, dest);
  },
  decode(input: AllowSharedBufferSource): string {
    return this[" d"].decode(input);
  },
};
