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

// https://www.rfc-editor.org/rfc/rfc8949.html#name-well-formedness-errors-and-
export class CborWellFormednessError extends SurrealError {
  static {
    this.prototype.name = "CborWellFormednessError";
  }
}

// https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-2.2
export class CborTooMuchDataError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborTooMuchDataError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("There are input bytes left that were not consumed.", options);
  }
}

// https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-2.4
export class CborTooLittleDataError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborTooLittleDataError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("There are input bytes left that were not consumed.", options);
  }
}

// https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-2.6
export class CborSyntaxError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborSyntaxError";
  }
}

// /**
//  * CBOR 関連のエラーが継承するエラークラス。
//  */
// export class CborError extends SurrealError {}

// /**
//  * このエラーは、CBOR タグが未知である場合に投げられます。
//  */
// export class UnknownCborTag extends CborError {
//   static {
//     this.prototype.name = "UnknownCborTag";
//   }

//   /**
//    * @param tag 未知の CBOR タグ。
//    * @param options エラーオプション。
//    */
//   constructor(
//     tag: number | bigint,
//     options?: SurrealErrorOptions | undefined,
//   ) {
//     super(`Unknown CBOR tag: ${tag}`, options);
//   }
// }
