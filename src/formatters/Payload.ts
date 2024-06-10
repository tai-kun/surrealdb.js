import { DataConversionFailure } from "../errors";
import isArrayBuffer from "./isArrayBuffer";

/**
 * RPC リクエストのレスポンスデータを表すクラス。
 */
export default class Payload {
  #data: unknown;
  #text: string | null = null;
  #buff: ArrayBuffer | null = null;

  /**
   * @param data - データへの参照。これ以降 `data` を変更しないことを推奨します。
   * データはコピーされることが保証されていません。
   */
  constructor(data: unknown) {
    this.#data = data;
  }

  /**
   * レスポンスデータへの参照。
   * このデータに変更を加えることは推奨されません。
   */
  get raw(): unknown {
    return this.#data;
  }

  /**
   * レスポンスデータを UTF-8 文字列として返します。
   *
   * @returns UTF-8 文字列に変換されたレスポンスデータ。
   */
  async text(): Promise<string> {
    if (this.#text === null) {
      if (typeof this.#data === "string") {
        this.#text = this.#data;
      } else {
        const arrayBuffer = await this.arrayBuffer();
        const decorder = new TextDecoder("utf8");
        this.#text = decorder.decode(arrayBuffer);
      }
    }

    return this.#text;
  }

  /**
   * レスポンスデータを ArrayBuffer として返します。
   *
   * @returns ArrayBuffer に変換されたレスポンスデータ。
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    if (this.#buff === null) {
      try {
        const data: any = this.#data;
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
          this.#buff = buff;
        } else {
          throw null;
        }
      } catch (error) {
        throw new DataConversionFailure(
          "RpcResponseRawData",
          "ArrayBuffer",
          this.#buff,
          error == null ? undefined : {
            cause: error,
          },
        );
      }
    }

    return this.#buff;
  }
}
