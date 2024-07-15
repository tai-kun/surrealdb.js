import type { Uuid } from "@tai-kun/surreal/values";
import type { Patch } from "./Patch";
import type { RecordData } from "./QueryResult";

/**
 * 通知がトリガーされたアクションの種類。
 */
export type LiveAction = "CREATE" | "UPDATE" | "DELETE";

/**
 * ライブクエリーの結果。
 * このデータは双方向通信の {@link IdLessRpcResponseOk} の `result` プロパティに格納される。
 *
 * @template T レコードのデータの型。
 * @template I ライブクエリーの ID の型。
 */
export interface LiveData<
  T extends RecordData = RecordData,
  I extends string | Uuid = string | Uuid,
> {
  /**
   * 通知がトリガーされたアクションの種類。
   */
  action: LiveAction;
  /**
   * ライブクエリーの ID。
   */
  id: I;
  /**
   * レコードのデータ。
   */
  result: T;
}

/**
 * ライブクエリーの結果。
 * このデータは双方向通信の {@link IdLessRpcResponseOk} の `result` プロパティに格納される。
 *
 * @template T レコードのデータの型。
 * @template P パッチ形式の変更内容の型。
 * @template I ライブクエリーの ID の型。
 */
export type LiveDiff<
  T extends RecordData = RecordData,
  P extends readonly Patch[] = Patch[],
  I extends string | Uuid = string | Uuid,
> = {
  /**
   * 通知がトリガーされたアクションの種類。
   */
  action: "CREATE" | "UPDATE";
  /**
   * ライブクエリーの ID。
   */
  id: I;
  /**
   * パッチ形式の変更内容。
   */
  result: P;
} | {
  /**
   * 通知がトリガーされたアクションの種類。
   */
  action: "DELETE";
  /**
   * ライブクエリーの ID。
   */
  id: I;
  /**
   * レコードのデータ。
   */
  result: T;
};

/**
 * ライブクエリーの結果。
 * このデータは双方向通信の {@link IdLessRpcResponseOk} の `result` プロパティに格納される。
 *
 * @template T レコードのデータの型。
 * @template P パッチ形式の変更内容の型。
 * @template I ライブクエリーの ID の型。
 */
export type LiveResult<
  T extends RecordData = RecordData,
  P extends readonly Patch[] = Patch[],
  I extends string | Uuid = string | Uuid,
> =
  | LiveData<T, I>
  | LiveDiff<T, P, I>;
