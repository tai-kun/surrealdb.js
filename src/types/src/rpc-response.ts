import type { Patch } from "./patch";
import type { QueryResult } from "./query-result";
import type { RpcMethod } from "./rpc-request";

type Arrayable<T> = T | T[];

type TableRecord = {
  id: string | object;
  [p: string]: unknown;
};

export type RpcResultMapping = {
  ping: void;
  use: void;
  info: TableRecord;
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

export type RpcResult<M extends RpcMethod = RpcMethod> = RpcResultMapping[M];

export type BidirectionalRpcResponseOk<T = unknown> = {
  id: `${RpcMethod}_${number}`;
  result: T;
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

export type BidirectionalRpcResponse<T = unknown> =
  | BidirectionalRpcResponseOk<T>
  | BidirectionalRpcResponseErr;

export type IdLessRpcResponseOk<T = unknown> = Omit<
  BidirectionalRpcResponseOk<T>,
  "id"
>;

export type IdLessRpcResponseErr = Omit<BidirectionalRpcResponseErr, "id">;

export type IdLessRpcResponse<T = unknown> =
  | IdLessRpcResponseOk<T>
  | IdLessRpcResponseErr;

export type RpcResponse<T = unknown> =
  | BidirectionalRpcResponse<T>
  | IdLessRpcResponse<T>;
