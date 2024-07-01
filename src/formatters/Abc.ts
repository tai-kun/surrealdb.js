import type { Promisable } from "type-fest";
import Payload from "./Payload";

/**
 * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザーの基底クラス。
 */
export default abstract class FormatterAbc {
  /**
   * @param mimeType MIME タイプ。
   * @param protocol Websocket プロトコル。
   */
  constructor(
    readonly mimeType?: string | undefined,
    readonly protocol?: string | undefined,
  ) {}

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
  abstract encode(data: unknown): Promisable<string | ArrayBuffer>;

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
  abstract decode(payload: Payload): Promisable<unknown>;

  /**
   * 与えられたデータを一度エンコードしてからデコードすることで、データのコピーを行います。
   *
   * @param data コピーするデータ。
   * @returns コピーされたデータ。
   * @example
   * ```ts
   * const data = { foo: "bar" };
   * const copied = await formatter.copy(data);
   * ```
   */
  async copy<T>(data: T): Promise<T> {
    const rawData = await this.encode(data);
    const payload = new Payload(rawData);

    return await this.decode(payload) as T;
  }
}
