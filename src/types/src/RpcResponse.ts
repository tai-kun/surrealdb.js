import type { Thing, Uuid } from "@tai-kun/surreal/values";
import type { Patch } from "./Patch";
import type { QueryResult, RecordData } from "./QueryResult";
import type { RpcMethod } from "./RpcRequest";

type Arrayable<T> = T | T[];

type TableRecord = { id: string | Thing } & RecordData;

/**
 * RPC メソッドごとの結果のマッピング。
 */
export interface RpcResultMapping {
  ping: void;
  use: void;
  info: TableRecord;
  signup: string;
  signin: string;
  authenticate: void;
  invalidate: void;
  let: void;
  unset: void;
  live: string | Uuid;
  kill: void;
  query: QueryResult[];
  select: Arrayable<TableRecord>;
  create: Arrayable<TableRecord>;
  insert: Arrayable<TableRecord>;
  update: Arrayable<TableRecord>;
  merge: Arrayable<TableRecord>;
  patch: Arrayable<TableRecord> | Arrayable<Patch>[];
  delete: Arrayable<TableRecord>;
  version: string;
  run: unknown;
  relate: Arrayable<TableRecord>;
}

/**
 * RPC リクエストの結果。
 *
 * @template M RPC リクエストのメソッドの型。
 */
export type RpcResult<M extends RpcMethod = RpcMethod> = RpcResultMapping[M];

interface BidirectionalRpcResponseBase {
  /**
   * RPC リクエストを識別する ID。
   *
   * **注意:**
   * これはリクエスト ID として有効な文字列である必要があります。 たとえば、`<letter>:<number>`
   * のような形式はレコード ID として解釈され、リクエストが無効になります。
   *
   * @see https://github.com/surrealdb/surrealdb/blob/v1.5.1/core/src/rpc/request.rs#L35-L44
   */
  id: `${RpcMethod}/${string | number}`;
}

/**
 * RPC リクエストが成功した場合のレスポンス。
 *
 * @template T リクエストの結果の型。
 */
export interface BidirectionalRpcResponseOk<T = unknown>
  extends BidirectionalRpcResponseBase
{
  /**
   * リクエストの結果。
   */
  result: T;
  /**
   * リクエストのエラー。リクエストが成功した場合、このプロパティは存在しません。
   */
  error?: never;
}

/**
 * RPC リクエストが失敗した場合のレスポンス。
 */
export interface BidirectionalRpcResponseErr
  extends BidirectionalRpcResponseBase
{
  /**
   * リクエストの結果。リクエストが失敗した場合、このプロパティは存在しません。
   */
  result?: never;
  /**
   * リクエストのエラー情報。
   */
  error: {
    /**
     * エラーコード。
     */
    code: number;
    /**
     * エラーメッセージ。
     */
    message: string;
  };
}

/**
 * RPC リクエストのレスポンス。
 *
 * @template T リクエストの結果の型。
 */
export type BidirectionalRpcResponse<T = unknown> =
  | BidirectionalRpcResponseOk<T>
  | BidirectionalRpcResponseErr;

/**
 * RPC リクエストが成功した場合のレスポンス。`id` プロパティが不要または決定できない場合のレスポンス。
 *
 * @template T リクエストの結果の型。
 */
export interface IdLessRpcResponseOk<T = unknown>
  extends Omit<BidirectionalRpcResponseOk<T>, "id">
{}

/**
 * RPC リクエストが失敗した場合のレスポンス。`id` プロパティが不要または決定できない場合のレスポンス。
 */
export interface IdLessRpcResponseErr
  extends Omit<BidirectionalRpcResponseErr, "id">
{}

/**
 * RPC リクエストのレスポンス。`id` プロパティが不要または決定できない場合のレスポンス。
 *
 * @template T リクエストの結果の型。
 */
export type IdLessRpcResponse<T = unknown> =
  | IdLessRpcResponseOk<T>
  | IdLessRpcResponseErr;

/**
 * RPC リクエストのレスポンス。
 *
 * @template T リクエストの結果の型。
 */
export type RpcResponse<T = unknown> =
  | BidirectionalRpcResponse<T>
  | IdLessRpcResponse<T>;
