import type { StatefulPromise } from "@tai-kun/surrealdb/utils";
import type EncodedCBOR from "./encoded-cbor";
import type EncodedJSON from "./encoded-json";

export type Data = typeof globalThis extends
  { Buffer: new(...args: any) => infer Buff }
  ? string | ArrayBuffer | Uint8Array | Buff | Buff[]
  : string | ArrayBuffer | Uint8Array;

// dprint-ignore
export type EncodedData = typeof globalThis extends
  { Buffer: new(...args: any) => infer Buff }
  ? string | Uint8Array | Buff
  : string | Uint8Array

export interface Formatter {
  readonly mimeType?: string | undefined;
  readonly wsFormat?: string | undefined;
  readonly toEncoded?: (data: unknown) => EncodedCBOR | EncodedJSON;
  readonly encodeSync: (data: unknown) => EncodedData;
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
