import type { ToCBOR } from "@tai-kun/surrealdb/cbor";
import type { StatefulPromise } from "@tai-kun/surrealdb/utils";

export type Data = typeof globalThis extends
  { Buffer: new(...args: any) => infer Buff }
  ? string | ArrayBuffer | Uint8Array | Buff | Buff[]
  : string | ArrayBuffer | Uint8Array;

export type EncodedCBOR = ToCBOR;

export type EncodedJSON = {
  readonly toJSON: () => unknown; // toRawJSON に対応していない場合に備える
  readonly toRawJSON?: (() => string) | undefined;
};

export type Encoded = EncodedCBOR | EncodedJSON;

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
  readonly decode?: (
    data: ReadableStream<Uint8Array>,
    signal: AbortSignal,
  ) => StatefulPromise<unknown>;
}
