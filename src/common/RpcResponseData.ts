import { DataConversionFailure } from "./errors";
import type { RpcResponseRawData } from "./types";

/**
 * The response data from an RPC request.
 */
export class RpcResponseData {
  #data: RpcResponseRawData;
  #text: string | null = null;
  #buff: ArrayBuffer | null = null;

  /**
   * Creates a new `RpcResponseData` instance.
   *
   * @param rawData - The reference to the raw response data.
   * We recommend not making changes to `rawData` from this point onward.
   * This data is not guaranteed to be copied.
   */
  constructor(rawData: RpcResponseRawData) {
    this.#data = rawData;
  }

  /**
   * The reference to the raw response data.
   * We recommend not making changes to this data.
   */
  get raw(): RpcResponseRawData {
    return this.#data;
  }

  /**
   * Returns the response data as a UTF-8 string.
   *
   * @returns The response data as a UTF-8 string.
   */
  async text(): Promise<string> {
    if (this.#text === null) {
      if (typeof this.#data === "string") {
        this.#text = this.#data;
      } else {
        const arrayBuffer = await this.arrayBuffer();
        const decorder = new TextDecoder("utf-8");
        this.#text = decorder.decode(arrayBuffer);
      }
    }

    return this.#text;
  }

  /**
   * Returns the response data as an ArrayBuffer.
   *
   * @returns The response data as an ArrayBuffer.
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    if (!this.#buff) {
      try {
        if (typeof this.#data === "string") {
          const encoder = new TextEncoder();
          this.#buff = encoder.encode(this.#data).buffer;
        } else if ("arrayBuffer" in this.#data) {
          this.#buff = await this.#data.arrayBuffer();
        } else if ("buffer" in this.#data) {
          this.#buff = this.#data.buffer.slice(
            this.#data.byteOffset,
            this.#data.byteOffset + this.#data.byteLength,
          );
        } else {
          this.#buff = this.#data;
        }

        if (!(this.#buff instanceof ArrayBuffer)) {
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
