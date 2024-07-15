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
 * @template T クエリーの結果の型。
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
 * @template T クエリーの結果の型。
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
