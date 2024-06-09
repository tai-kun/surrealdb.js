import type { Promisable } from "type-fest";
import Payload from "./Payload";

/**
 * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザーの基底クラス。
 */
export default abstract class FormatterAbc {
  /**
   * @param mimeType - MIME タイプ。
   * @param protocol - Websocket プロトコル。
   */
  constructor(
    readonly mimeType?: string | undefined,
    readonly protocol?: string | undefined,
  ) {}

  /**
   * データを文字列または ArrayBuffer にエンコードします。
   *
   * @param data - エンコードするデータ。
   * @returns エンコードされたデータ。
   */
  abstract encode(data: unknown): Promisable<string | ArrayBuffer>;

  /**
   * データをデコードします。
   *
   * @param data - RPC リクエストのレスポンスデータ。
   * @returns デコードされたデータ。
   */
  abstract decode(payload: Payload): Promisable<unknown>;

  /**
   * データをコピーします。
   *
   * @param data - コピーするデータ。
   * @returns コピーされたデータ。
   */
  async copy<T>(data: T): Promise<T> {
    const rawData = await this.encode(data);
    const payload = new Payload(rawData);

    return await this.decode(payload) as T;
  }
}
