import { DataFormatError } from "@tai-kun/surreal/errors";
import { isArrayBuffer } from "@tai-kun/surreal/utils";

/**
 * RPC リクエストのレスポンスデータを表すクラス。
 * レスポンスデータは、HTTP のレスポンスボディや WebSocket のメッセージの内容のことです。
 */
export default class Payload {
  protected _data: unknown;
  protected _text: string | null = null;
  protected _buff: ArrayBuffer | null = null;

  /**
   * @param data データへの参照。これ以降 `data` を変更しないことを推奨します。
   * データはコピーされることが保証されていません。
   */
  constructor(data: unknown) {
    this._data = data;
  }

  /**
   * レスポンスデータへの参照。
   * このデータに変更を加えることは推奨されません。
   */
  get raw(): unknown {
    return this._data;
  }

  /**
   * レスポンスデータを UTF-8 文字列として返します。
   *
   * @returns UTF-8 文字列に変換されたレスポンスデータ。
   * @example
   * ```ts
   * const payloadAsText = await payload.text();
   * ```
   */
  async text(): Promise<string> {
    if (this._text === null) {
      if (typeof this._data === "string") {
        this._text = this._data;
      } else {
        const arrayBuffer = await this.arrayBuffer();
        const decorder = new TextDecoder("utf8");
        this._text = decorder.decode(arrayBuffer);
      }
    }

    return this._text;
  }

  /**
   * レスポンスデータを ArrayBuffer として返します。
   *
   * @returns ArrayBuffer に変換されたレスポンスデータ。
   * @example
   * ```ts
   * const payloadAsArrayBuffer = await payload.arrayBuffer();
   * ```
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    if (this._buff === null) {
      try {
        const data: any = this._data;
        let buff: unknown;

        if (typeof data === "string") {
          const encoder = new TextEncoder();
          buff = encoder.encode(data).buffer;
        } else if (typeof data !== "object" || data === null) {
          buff = null;
        } else if ("arrayBuffer" in data) {
          buff = await data.arrayBuffer();
        } else if ("buffer" in data) {
          buff = data.buffer.slice(
            data.byteOffset,
            data.byteOffset + data.byteLength,
          );
        } else {
          buff = data;
        }

        if (isArrayBuffer(buff)) {
          this._buff = buff;
        } else {
          throw null;
        }
      } catch (error) {
        throw new DataFormatError(
          "RpcResponseRawData",
          "ArrayBuffer",
          this._buff,
          error == null ? undefined : {
            cause: error,
          },
        );
      }
    }

    return this._buff;
  }
}
