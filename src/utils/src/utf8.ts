export default {
  // 戦闘を空白にすると入力補完の候補から排除される。
  [" e"]: /* @__PURE__ */ new TextEncoder(),
  [" d"]: /* @__PURE__ */ new TextDecoder("utf-8", {
    fatal: true,
    ignoreBOM: true,
  }),
  encode(input: string): Uint8Array {
    return this[" e"].encode(input);
  },
  decode(input: AllowSharedBufferSource): string {
    return this[" d"].decode(input);
  },
};
