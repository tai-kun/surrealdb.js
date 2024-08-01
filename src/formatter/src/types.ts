export type Data = typeof globalThis extends
  { Buffer: new(...args: any) => infer Buff }
  ? string | ArrayBuffer | Uint8Array | Buff | Buff[]
  : string | ArrayBuffer | Uint8Array;

export interface DecodeArgs {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  signal: AbortSignal;
}

export interface Formatter {
  readonly mimeType?: string | undefined;
  readonly wsFormat?: string | undefined;
  readonly encodeSync: (data: unknown) => string | Uint8Array;
  readonly decodeSync: (data: Data) => unknown;
  // readonly encode?: (
  //   args: {
  //     writer: ???;
  //     signal: AbortSignal;
  //   },
  // ) => PromiseLike<unknown>;
  readonly decode?: (args: DecodeArgs) => PromiseLike<unknown>;
}
