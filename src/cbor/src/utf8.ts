export default {
  _e: /* @__PURE__ */ new TextEncoder(),
  _d: /* @__PURE__ */ new TextDecoder("utf-8", {
    fatal: true,
    ignoreBOM: true,
  }),
  encode(input: string): Uint8Array {
    return this._e.encode(input);
  },
  decode(input: AllowSharedBufferSource): string {
    return this._d.decode(input);
  },
};
