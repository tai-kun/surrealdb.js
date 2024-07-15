import { SurrealError, type SurrealErrorOptions } from "./shared";

/**
 * このエラーは、`Payload` クラスがレスポンスデータを ArrayBuffer へ変換するのに失敗したときに投げられます。
 * そのため、このエラーはフォーマッターがレスポンスデータを JavaScript の値にデコードするのに失敗したことを意味します。
 */
export class DataFormatError extends SurrealError {
  static {
    this.prototype.name = "DataFormatError";
  }

  /**
   * @param from 変換元のデータ型。
   * @param to 変換先のデータ型。
   * @param source エラーの原因となったデータ。
   * @param options エラーオプション。
   */
  constructor(
    from: string,
    to: string,
    public source: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`Failed to convert the data from ${from} to ${to}.`, options);
  }
}

/**
 * CBOR 関連のエラーが継承するエラークラス。
 */
export class CborError extends SurrealError {}

/**
 * このエラーは、CBOR タグが未知である場合に投げられます。
 */
export class UnknownCborTag extends CborError {
  static {
    this.prototype.name = "UnknownCborTag";
  }

  /**
   * @param tag 未知の CBOR タグ。
   * @param options エラーオプション。
   */
  constructor(
    tag: number | bigint,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`Unknown CBOR tag: ${tag}`, options);
  }
}
