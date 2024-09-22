import type { Patch } from "./patch";
import type { QueryResult } from "./query-result";
import type { RpcMethod } from "./rpc-request";

type Arrayable<TResult> = TResult | TResult[];

type TypeMap = Record<
  | "Uuid"
  | "Thing",
  object
>;

// DEFINE TABLE ... TYPE NORMAL
type NormalRecord<TTypeMap extends TypeMap> = {
  id: string | TTypeMap["Thing"];
  [p: string]: unknown;
};

// DEFINE TABLE ... TYPE RELATION
type RelationRecord<TTypeMap extends TypeMap> = {
  id: string | TTypeMap["Thing"];
  in: string | TTypeMap["Thing"];
  out: string | TTypeMap["Thing"];
  [p: string]: unknown;
};

export type RpcResultMapping<TTypeMap extends TypeMap = TypeMap> = {
  ping: void;
  use: void;
  info: NormalRecord<TTypeMap> | null | undefined; // JSON: null, CBOR: undefined
  signup: string;
  signin: string;
  authenticate: void;
  invalidate: void;
  let: void;
  unset: void;
  live: string | TTypeMap["Uuid"];
  kill: void;
  query: QueryResult[];
  select: Arrayable<NormalRecord<TTypeMap>>;
  create: Arrayable<NormalRecord<TTypeMap>>;
  insert: NormalRecord<TTypeMap>[];
  insert_relation: RelationRecord<TTypeMap>[];
  update: Arrayable<NormalRecord<TTypeMap>>;
  upsert: Arrayable<NormalRecord<TTypeMap>>;
  merge: Arrayable<NormalRecord<TTypeMap>>;
  patch: Arrayable<NormalRecord<TTypeMap>> | Arrayable<Patch>[];
  delete: Arrayable<NormalRecord<TTypeMap>>;
  version: string;
  run: unknown;
  graphql: unknown;
  relate: Arrayable<RelationRecord<TTypeMap>>;
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
