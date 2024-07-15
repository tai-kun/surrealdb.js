import type { Table, Thing, Uuid } from "@tai-kun/surreal/values";
import type { Auth, ScopeAuth } from "./Auth";
import type { ReadonlyPatch } from "./Patch";
import type { RecordInputData } from "./QueryResult";

interface RpcRequestBase<M extends string, P extends readonly unknown[]> {
  /**
   * 呼び出す RPC メソッド。
   */
  readonly method: M;
  /**
   * メソッドに渡すパラメーター。
   */
  readonly params: P;
}

/**
 * サーバーに ping を送信する RPC リクエスト。
 */
export interface RpcPingRequest extends RpcRequestBase<"ping", readonly []> {}

/**
 * 現在の接続に対して名前空間とデータベースを設定する RPC リクエスト。
 */
export interface RpcUseRequest extends
  RpcRequestBase<
    "use",
    readonly [
      ns?: string | null | undefined,
      db?: string | null | undefined,
    ]
  >
{}

/**
 * `$auth` 変数からすべてを `SELECT` する RPC リクエスト。
 */
export interface RpcInfoRequest extends RpcRequestBase<"info", readonly []> {}

/**
 * サーバーにユーザーを登録する RPC リクエスト。
 */
export interface RpcSignupRequest
  extends RpcRequestBase<"signup", readonly [auth: ScopeAuth]>
{}

/**
 * 認証情報を使用してユーザーを認証する RPC リクエスト。
 */
export interface RpcSigninRequest
  extends RpcRequestBase<"signin", readonly [auth: Auth]>
{}

/**
 * トークンを使用してユーザーを認証する RPC リクエスト。
 */
export interface RpcAuthenticateRequest
  extends RpcRequestBase<"authenticate", readonly [token: string]>
{}

/**
 * 現在の接続に対してユーザーのセッションを無効にする RPC リクエスト。
 */
export interface RpcInvalidateRequest
  extends RpcRequestBase<"invalidate", readonly []>
{}

/**
 * 現在の接続で利用可能な変数を定義する RPC リクエスト。
 */
export interface RpcLetRequest extends
  RpcRequestBase<
    "let",
    readonly [
      name: string,
      value: unknown,
    ]
  >
{}

/**
 * 現在の接続で定義された変数を削除する RPC リクエスト。
 */
export interface RpcUnsetRequest extends
  RpcRequestBase<
    "unset",
    readonly [name: string]
  >
{}

/**
 * ライブクエリーを開始する RPC リクエスト。
 */
export interface RpcLiveRequest extends
  RpcRequestBase<
    "live",
    readonly [
      table: string | Table,
      diff?: boolean | null | undefined,
    ]
  >
{}

/**
 * 実行中のライブクエリーを終了する RPC リクエスト。
 */
export interface RpcKillRequest extends
  RpcRequestBase<
    "kill",
    readonly [queryUuid: string | Uuid]
  >
{}

/**
 * オプションの変数を使用してカスタムクエリーを実行する RPC リクエスト。
 */
export interface RpcQueryRequest extends
  RpcRequestBase<
    "query",
    readonly [
      surql: string | {
        readonly text: string;
        readonly vars?: RecordInputData | null | undefined;
      },
      vars?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * テーブル内のすべてのレコードまたは単一のレコードを選択する RPC リクエスト。
 */
export interface RpcSelectRequest extends
  RpcRequestBase<
    "select",
    readonly [thing: string | Thing]
  >
{}

/**
 * ランダムまたは指定された ID でレコードを作成する RPC リクエス
 */
export interface RpcCreateRequest extends
  RpcRequestBase<
    "create",
    readonly [
      thing: string | Thing,
      data?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * テーブルに 1 つまたは複数のレコードを挿入する RPC リクエスト。
 */
export interface RpcInsertRequest extends
  RpcRequestBase<
    "insert",
    readonly [
      thing: string | Thing,
      data?: RecordInputData | readonly RecordInputData[] | null | undefined,
    ]
  >
{}

/**
 * テーブル内のすべてのレコードまたは単一のレコードを指定されたデータで置き換える RPC リクエスト。
 */
export interface RpcUpdateRequest extends
  RpcRequestBase<
    "update",
    readonly [
      thing: string | Thing,
      data?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * 指定されたデータをテーブル内のすべてのレコードまたは単一のレコードにマージする RPC リクエスト。
 */
export interface RpcMergeRequest extends
  RpcRequestBase<
    "merge",
    readonly [
      thing: string | Thing,
      data: RecordInputData,
    ]
  >
{}

/**
 * テーブル内のすべてのレコードまたは単一のレコードに指定されたパッチを適用する RPC リクエスト。
 */
export interface RpcPatchRequest extends
  RpcRequestBase<
    "patch",
    readonly [
      thing: string | Thing,
      patches: readonly ReadonlyPatch[],
      diff?: boolean | null | undefined,
    ]
  >
{}

/**
 * テーブル内のすべてのレコードまたは単一のレコードを削除する RPC リクエスト。
 */
export interface RpcDeleteRequest extends
  RpcRequestBase<
    "delete",
    readonly [thing: string | Thing]
  >
{}

/**
 * SurrealDB のバージョンを取得する RPC リクエスト。
 */
export interface RpcVersionRequest
  extends RpcRequestBase<"version", readonly []>
{}

/**
 * SurrealQL 関数を実行する RPC リクエスト。
 */
export interface RpcRunRequest extends
  RpcRequestBase<
    "run",
    readonly [
      funcName: string,
      version?: string | null | undefined,
      args?: readonly unknown[] | null | undefined,
    ]
  >
{}

/**
 * レコード間にグラフエッジを作成する RPC リクエスト。
 */
export interface RpcRelateRequest extends
  RpcRequestBase<
    "relate",
    readonly [
      from: string | Thing | readonly Thing[],
      thing: string | Thing,
      to: string | Thing | readonly Thing[],
      data?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * RPC リクエスト。
 */
export type RpcRequest =
  | RpcPingRequest
  | RpcUseRequest
  | RpcInfoRequest
  | RpcSignupRequest
  | RpcSigninRequest
  | RpcAuthenticateRequest
  | RpcInvalidateRequest
  | RpcLetRequest
  | RpcUnsetRequest
  | RpcLiveRequest
  | RpcKillRequest
  | RpcQueryRequest
  | RpcSelectRequest
  | RpcCreateRequest
  | RpcInsertRequest
  | RpcUpdateRequest
  | RpcMergeRequest
  | RpcPatchRequest
  | RpcDeleteRequest
  | RpcVersionRequest
  | RpcRunRequest
  | RpcRelateRequest;

/**
 * RPC リクエストのメソッド。
 */
export type RpcMethod = RpcRequest["method"];

/**
 * RPC リクエストのパラメーター。
 *
 * @template M RPC リクエストのメソッドの型。
 */
export type RpcParams<M extends RpcMethod = RpcMethod> = Extract<
  RpcRequest,
  { method: M }
>["params"];
