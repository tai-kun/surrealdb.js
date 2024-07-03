import type {
  IdLessRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "~/index/types";

/**
 * RPC に関連する値を検証する際のコンテキスト。
 */
export interface ParseContext {
  /**
   * 接続先のエンドポイント。
   */
  endpoint: URL;
  /**
   * エンジン名。
   */
  engineName: string;
}

/**
 * RPC のレスポンスを検証する際のコンテキスト。
 */
export interface ParseResponseContext extends ParseContext {
  /**
   * RPC リクエスト。
   */
  request: RpcRequest;
}

/**
 * 各種データの検証を行うバリデーター。
 */
export interface Validator {
  /**
   * RPC リクエストを検証する関数。
   */
  parseRpcRequest: {
    /**
     * RPC リクエストを検証します。
     *
     * @param input 入力データ。
     * @param context コンテキスト。
     * @returns RPC リクエスト。
     */
    (
      input: Record<keyof RpcRequest, unknown>,
      context: ParseContext,
    ): RpcRequest;
  };
  /**
   * `id` 無しの RPC レスポンスを検証する関数。
   */
  parseIdLessRpcResponse: {
    /**
     * `id` 無しの RPC レスポンスを検証します。
     *
     * @param input 入力データ。
     * @param context コンテキスト。
     * @returns `id` 無しの RPC レスポンス。
     */
    (
      input: unknown,
      context: ParseResponseContext,
    ): IdLessRpcResponse;
  };

  /**
   * RPC の結果を検証する関数。
   */
  parseRpcResult: {
    /**
     * RPC の結果を検証します。
     *
     * @param input 入力データ。
     * @param context コンテキスト。
     * @returns RPC レスポンス。
     */
    (
      input: unknown,
      context: ParseResponseContext,
    ): unknown;
  };

  /**
   * RPC レスポンスを検証する関数。
   */
  parseRpcResponse: {
    /**
     * RPC レスポンスを検証します。
     *
     * @param input 入力データ。
     * @param context コンテキスト。
     * @returns RPC レスポンス。
     */
    (
      input: unknown,
      context: ParseContext,
    ): RpcResponse;
  };

  /**
   * ライブクエリーの結果を検証する関数。
   */
  parseLiveResult: {
    /**
     * ライブクエリーの結果を検証します。
     *
     * @param input 入力データ。
     * @param context コンテキスト。
     * @returns ライブクエリーの結果。
     */
    (
      input: unknown,
      context: ParseContext,
    ): LiveResult;
  };
}
