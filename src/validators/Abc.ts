import type {
  IdLessRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "../types";

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
 * RPC のレスポンスを解析する際のコンテキスト。
 */
export interface ParseResponseContext extends ParseContext {
  /**
   * RPC リクエスト。
   */
  request: RpcRequest;
}

/**
 * 各種データの検証を行うバリデータ-の基底クラス。
 */
export default abstract class ValidatorAbc {
  /**
   * RPC リクエストを解析する。
   *
   * @param input 入力データ。
   * @param context コンテキスト。
   * @returns RPC リクエスト。
   */
  abstract parseRpcRequest(
    input: Record<keyof RpcRequest, unknown>,
    context: ParseContext,
  ): RpcRequest;

  /**
   * `id` 無しの RPC レスポンスを解析する。
   *
   * @param input 入力データ。
   * @param context コンテキスト。
   * @returns `id` 無しの RPC レスポンス。
   */
  abstract parseIdLessRpcResponse(
    input: unknown,
    context: ParseResponseContext,
  ): IdLessRpcResponse;

  /**
   * RPC の結果を解析する。
   *
   * @param input 入力データ。
   * @param context コンテキスト。
   * @returns RPC レスポンス。
   */
  abstract parseRpcResult(
    input: unknown,
    context: ParseResponseContext,
  ): unknown;

  /**
   * RPC レスポンスを解析する。
   *
   * @param input 入力データ。
   * @param context コンテキスト。
   * @returns RPC レスポンス。
   */
  abstract parseRpcResponse(
    input: unknown,
    context: ParseContext,
  ): RpcResponse;

  /**
   * ライブクエリーの結果を解析する。
   *
   * @param input 入力データ。
   * @param context コンテキスト。
   * @returns ライブクエリーの結果。
   */
  abstract parseLiveResult(
    input: unknown,
    context: ParseContext,
  ): LiveResult;
}
