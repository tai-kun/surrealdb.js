import type { Patch } from "./patch";
import type { QueryResult } from "./query-result";
import type { RpcMethod } from "./rpc-request";

type Arrayable<TResult> = TResult | TResult[];

type TableRecord = {
  id: string | object;
  [p: string]: unknown;
};

export type RpcResultMapping = {
  ping: void;
  use: void;
  info: TableRecord | null | undefined; // JSON: null, CBOR: undefined
  signup: string;
  signin: string;
  authenticate: void;
  invalidate: void;
  let: void;
  unset: void;
  live: string | object;
  kill: void;
  query: QueryResult[];
  select: Arrayable<TableRecord>;
  create: Arrayable<TableRecord>;
  insert: TableRecord[];
  update: Arrayable<TableRecord>;
  upsert: Arrayable<TableRecord>;
  merge: Arrayable<TableRecord>;
  patch: Arrayable<TableRecord> | Arrayable<Patch>[];
  delete: Arrayable<TableRecord>;
  version: string;
  run: unknown;
  relate: Arrayable<TableRecord>;
};

export type RpcResult<TMethod extends RpcMethod = RpcMethod> =
  RpcResultMapping[TMethod];

export type BidirectionalRpcResponseOk<TResult = unknown> = {
  id: `${RpcMethod}_${number}`;
  result: TResult;
  error?: never;
};

export type BidirectionalRpcResponseErr = {
  id: `${RpcMethod}_${number}`;
  result?: never;
  error: {
    code: number;
    message: string;
  };
};

export type BidirectionalRpcResponse<TResult = unknown> =
  | BidirectionalRpcResponseOk<TResult>
  | BidirectionalRpcResponseErr;

export type IdLessRpcResponseOk<TResult = unknown> = Omit<
  BidirectionalRpcResponseOk<TResult>,
  "id"
>;

export type IdLessRpcResponseErr = Omit<BidirectionalRpcResponseErr, "id">;

export type IdLessRpcResponse<TResult = unknown> =
  | IdLessRpcResponseOk<TResult>
  | IdLessRpcResponseErr;

export type RpcResponse<TResult = unknown> =
  | BidirectionalRpcResponse<TResult>
  | IdLessRpcResponse<TResult>;
