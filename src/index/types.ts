import type { TableType, ThingType, UuidType } from "./values";

/******************************************************************************
 * Query Types
 *****************************************************************************/

interface QueryResultBase<S extends string> {
  /**
   * クエリーの成否を示すステータス。
   */
  status: S;
  /**
   * クエリーの実行時間。
   */
  time: string;
}

/**
 * クエリーが成功した場合の結果。
 *
 * @template T - クエリーの結果の型。
 */
export interface QueryResultOk<T = unknown> extends QueryResultBase<"OK"> {
  /**
   * クエリーの結果。
   */
  result: T;
}

/**
 * クエリーが失敗した場合の結果。
 */
export interface QueryResultErr extends QueryResultBase<"ERR"> {
  /**
   * エラーメッセージ。
   */
  result: string;
}

/**
 * クエリーの結果。
 *
 * @template T - クエリーの結果の型。
 */
export type QueryResult<T = unknown> = QueryResultOk<T> | QueryResultErr;

/**
 * 入力用のレコードデータ。
 */
export type RecordInputData = {
  readonly [_ in string | number]?: unknown;
};

/**
 * 一般的なレコードデータ。
 */
export type RecordData = {
  [key: string]: unknown;
};

/******************************************************************************
 * Patch Types
 * @see https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/operation.rs
 *****************************************************************************/

/**
 * 値を追加するパッチ操作。
 *
 * @template T - 追加する値の型。
 * @template P - パスの型。
 */
export interface AddPatch<T = unknown, P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "add";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 追加する/された値。
   */
  value: T;
}

/**
 * 値を削除するパッチ操作。
 *
 * @template P - パスの型。
 */
export interface RemovePatch<P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "remove";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
}

/**
 * 値を置換するパッチ操作。
 *
 * @template T - 置換する値の型。
 * @template P - パスの型。
 */
export interface ReplacePatch<T = unknown, P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "replace";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 置換する/された値。
   */
  value: T;
}

/**
 * 値を変更するパッチ操作。
 *
 * @template T - 変更する値の型。
 * @template P - パスの型。
 */
export interface ChangePatch<
  T extends string = string,
  P extends string = string,
> {
  /**
   * パッチの操作名。
   */
  op: "change";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 変更する/された値。
   */
  value: T;
}

/**
 * 値をコピーするパッチ操作。
 *
 * @template F - コピー元のパスの型。
 * @template P - コピー先のパスの型。
 */
export interface CopyPatch<
  F extends string = string,
  P extends string = string,
> {
  /**
   * パッチの操作名。
   */
  op: "copy";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * コピー元のパス。
   */
  from: F;
}

/**
 * 値を移動するパッチ操作。
 *
 * @template F - 移動元のパスの型。
 * @template P - 移動先のパスの型。
 */
export interface MovePatch<
  F extends string = string,
  P extends string = string,
> {
  /**
   * パッチの操作名。
   */
  op: "move";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 移動元のパス。
   */
  from: F;
}

/**
 * 値が設定されているかテストするパッチ操作。
 *
 * @template T - テストする値の型。
 * @template P - パスの型。
 */
export interface TestPatch<T = unknown, P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "test";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * テストする値。
   */
  value: T;
}

/**
 * パッチ操作。
 *
 * @template T - 値の型。
 */
export type Patch<T = unknown> =
  | AddPatch<T>
  | RemovePatch
  | ReplacePatch<T>
  | ChangePatch
  | MovePatch
  | CopyPatch
  | TestPatch<T>;

/**
 * 読み取り専用のパッチ操作。
 *
 * @template T - 値の型。
 */
export type ReadonlyPatch<T = unknown> =
  | Readonly<AddPatch<T>>
  | Readonly<RemovePatch>
  | Readonly<ReplacePatch<T>>
  | Readonly<ChangePatch>
  | Readonly<MovePatch>
  | Readonly<CopyPatch>
  | Readonly<TestPatch<T>>;

/******************************************************************************
 * Live Query Types
 *****************************************************************************/

/**
 * 通知がトリガーされたアクションの種類。
 */
export type LiveAction = "CREATE" | "UPDATE" | "DELETE";

/**
 * ライブクエリーの結果。
 * このデータは双方向通信の {@link IdLessRpcResponseOk} の `result` プロパティに格納される。
 *
 * @template T - レコードのデータの型。
 * @template I - ライブクエリーの ID の型。
 */
export interface LiveData<
  T extends RecordData = RecordData,
  I extends string | UuidType = string | UuidType,
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
 * @template T - レコードのデータの型。
 * @template P - パッチ形式の変更内容の型。
 * @template I - ライブクエリーの ID の型。
 */
export type LiveDiff<
  T extends RecordData = RecordData,
  P extends readonly Patch[] = Patch[],
  I extends string | UuidType = string | UuidType,
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
 * @template T - レコードのデータの型。
 * @template P - パッチ形式の変更内容の型。
 * @template I - ライブクエリーの ID の型。
 */
export type LiveResult<
  T extends RecordData = RecordData,
  P extends readonly Patch[] = Patch[],
  I extends string | UuidType = string | UuidType,
> =
  | LiveData<T, I>
  | LiveDiff<T, P, I>;

/******************************************************************************
 * Authentication Types
 *****************************************************************************/

/**
 * ルートユーザーの認証情報。
 */
export interface RootAuth {
  /** 認証する名前空間。 */
  readonly ns?: null | undefined;
  /** 認証するデータベース。 */
  readonly db?: null | undefined;
  /** 認証するスコープ。 */
  readonly sc?: null | undefined;
  /** 認証するユーザーの名前。 */
  readonly user: string;
  /** 認証するユーザーのパスワード */
  readonly pass: string;
}

/**
 * 名前空間ユーザーの認証情報。
 */
export interface NamespaceAuth {
  /** 認証する名前空間。 */
  readonly ns: string;
  /** 認証するデータベース。 */
  readonly db?: null | undefined;
  /** 認証するスコープ。 */
  readonly sc?: null | undefined;
  /** 認証するユーザーの名前。 */
  readonly user: string;
  /** 認証するユーザーのパスワード */
  readonly pass: string;
}

/**
 * データベースユーザーの認証情報。
 */
export interface DatabaseAuth {
  /** 認証する名前空間。 */
  readonly ns: string;
  /** 認証するデータベース。 */
  readonly db: string;
  /** 認証するスコープ。 */
  readonly sc?: null | undefined;
  /** 認証するユーザーの名前。 */
  readonly user: string;
  /** 認証するユーザーのパスワード */
  readonly pass: string;
}

/**
 * スコープユーザーの認証情報。
 */
export interface ScopeAuth {
  /** 認証する名前空間。 */
  readonly ns: string;
  /** 認証するデータベース。 */
  readonly db: string;
  /** 認証するスコープ。 */
  readonly sc: string;
  /** 認証に必要な値。 */
  readonly [key: string | number]: unknown; // RecordInputData
}

/**
 * システムユーザーの認証情報。
 */
export type SystemAuth = RootAuth | NamespaceAuth | DatabaseAuth;

/**
 * ユーザーの認証情報。
 */
export type Auth = SystemAuth | ScopeAuth;

/******************************************************************************
 * RPC Request Types
 *****************************************************************************/

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
      table: string | TableType,
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
    readonly [queryUuid: string | UuidType]
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
    readonly [thing: string | ThingType]
  >
{}

/**
 * ランダムまたは指定された ID でレコードを作成する RPC リクエス
 */
export interface RpcCreateRequest extends
  RpcRequestBase<
    "create",
    readonly [
      thing: string | ThingType,
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
      thing: string | ThingType,
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
      thing: string | ThingType,
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
      thing: string | ThingType,
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
      thing: string | ThingType,
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
    readonly [thing: string | ThingType]
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
      from: string | ThingType | readonly ThingType[],
      thing: string | ThingType,
      to: string | ThingType | readonly ThingType[],
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
 * @template M - RPC リクエストのメソッドの型。
 */
export type RpcParams<M extends RpcMethod = RpcMethod> = Extract<
  RpcRequest,
  { method: M }
>["params"];

/******************************************************************************
 * RPC Response Types
 *****************************************************************************/

type Arrayable<T> = T | T[];

type TableRecord = { id: string | ThingType } & RecordData;

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
  live: string | UuidType;
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
 * @template M - RPC リクエストのメソッドの型。
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
 * @template T - リクエストの結果の型。
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
 * @template T - リクエストの結果の型。
 */
export type BidirectionalRpcResponse<T = unknown> =
  | BidirectionalRpcResponseOk<T>
  | BidirectionalRpcResponseErr;

/**
 * RPC リクエストが成功した場合のレスポンス。`id` プロパティが不要または決定できない場合のレスポンス。
 *
 * @template T - リクエストの結果の型。
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
 * @template T - リクエストの結果の型。
 */
export type IdLessRpcResponse<T = unknown> =
  | IdLessRpcResponseOk<T>
  | IdLessRpcResponseErr;

/**
 * RPC リクエストのレスポンス。
 *
 * @template T - リクエストの結果の型。
 */
export type RpcResponse<T = unknown> =
  | BidirectionalRpcResponse<T>
  | IdLessRpcResponse<T>;
