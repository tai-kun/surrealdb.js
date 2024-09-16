import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import type { StatefulPromise } from "@tai-kun/surrealdb/utils";
import type EncodedCBOR from "./encoded-cbor";
import type EncodedJSON from "./encoded-json";

export type Data = typeof globalThis extends
  { Buffer: new(...args: any) => infer Buff }
  ? string | ArrayBuffer | Uint8Array | Buff | Buff[]
  : string | ArrayBuffer | Uint8Array;

// dprint-ignore
export type EncodedData = string | Uint8ArrayLike

export type DecodingContext =
  | { name: "fetch"; length: number }
  | never; // 追加

export type DecodingStrategy = "sync" | "stream";

export interface Formatter {
  //////////////
  //  config  //
  //////////////

  readonly contentType: string;
  readonly wsProtocols: string[];

  //////////////
  // encoding //
  //////////////

  readonly toEncoded?: <T>(data: T) => EncodedCBOR<T> | EncodedJSON<T>;
  readonly encodeSync: (data: unknown) => EncodedData;
  // readonly encodeStream?: () => PromiseLike<unknown>;

  //////////////
  // decoding //
  //////////////

  readonly decodeSync: (data: Data) => unknown;
  readonly decodeStream?: (
    data: ReadableStream<Uint8Array>,
    signal: AbortSignal,
  ) => StatefulPromise<unknown>;
  /**
   * @experimental
   */
  readonly decodingStrategy?: (ctx: DecodingContext) => DecodingStrategy;
}
