export type Uint8ArrayLike =
  | Uint8Array
  | (typeof globalThis extends { Buffer: new(...args: any) => infer B } ? B
    : never);
