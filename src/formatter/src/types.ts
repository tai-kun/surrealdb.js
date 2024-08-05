import type { ToCBOR } from "@tai-kun/surrealdb/cbor";

export type Data = typeof globalThis extends
  { Buffer: new(...args: any) => infer Buff }
  ? string | ArrayBuffer | Uint8Array | Buff | Buff[]
  : string | ArrayBuffer | Uint8Array;

// export interface DecodeArgs {
//   reader: ReadableStreamDefaultReader<Uint8Array>;
//   signal: AbortSignal;
// }

export type Encoded = ToCBOR | {
  readonly toJSON: () => unknown; // toRawJSON に対応していない場合に備える
  readonly toRawJSON?: (() => string) | undefined;
};

export interface Formatter {
  readonly mimeType?: string | undefined;
  readonly wsFormat?: string | undefined;
  readonly toEncoded?: (data: unknown) => Encoded;
  readonly encodeSync: (data: unknown) => string | Uint8Array;
  readonly decodeSync: (data: Data) => unknown;
  // readonly encode?: (
  //   args: {
  //     writer: ???;
  //     signal: AbortSignal;
  //   },
  // ) => PromiseLike<unknown>;
  // readonly decode?: (args: DecodeArgs) => PromiseLike<unknown>;
}
