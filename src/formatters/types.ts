import type { Promisable } from "type-fest";
import type Payload from "./Payload";

/**
 * クライアントとサーバー間で伝送されるデータのエンコーダーとデコーダー。
 */
export interface Formatter {
  /**
   * データの種類を示す MIME タイプ。HTTP 通信で使用される。
   */
  readonly mimeType?: string | undefined;
  /**
   * データのエンコード/デコード形式を示すフォーマットの名前。WebSocket 通信で使用される。
   */
  readonly wsFormat?: string | undefined;
  /**
   * データのエンコーダー。
   */
  readonly encode: {
    /**
     * データを文字列または ArrayBuffer にエンコードします。
     *
     * @param data エンコードするデータ。
     * @returns エンコードされたデータ。
     * @example
     * ```ts
     * const data = { foo: "bar" };
     * const encoded = await formatter.encode(data);
     * ```
     */
    (data: unknown): Promisable<string | ArrayBuffer>;
  };
  /**
   * データのデコーダー。
   */
  readonly decode: {
    /**
     * データをデコードします。
     *
     * @param data RPC リクエストのレスポンスデータ。
     * @returns デコードされたデータ。
     * @example
     * ```ts
     * const data = await formatter.decode(response);
     * ```
     */
    (payload: Payload): Promisable<unknown>;
  };
}
