import type { Promisable } from "type-fest";
import { RpcResponseData } from "../common/RpcResponseData";

/**
 * Serialized data for transmission.
 */
export type RpcData = string | ArrayBuffer;

/**
 * A formatter interface for encoding and decoding data.
 */
export abstract class Formatter {
  /**
   * Websocket protocol
   */
  readonly protocol?: string | undefined;

  /**
   * MIME type
   */
  readonly mimeType?: string | undefined;

  /**
   * Create a new formatter.
   *
   * @param mimeType - MIME type
   * @param protocol - Websocket protocol
   */
  constructor(mimeType?: string | undefined, protocol?: string | undefined) {
    this.mimeType = mimeType;
    this.protocol = protocol;
  }

  /**
   * Encode data to a string or ArrayBuffer.
   *
   * @param data - Data to encode
   * @returns Encoded data
   */
  abstract encode(data: unknown): Promisable<RpcData>;

  /**
   * Decode data.
   *
   * @param data - Data to decode
   * @returns Decoded data
   */
  abstract decode(data: RpcResponseData): Promisable<unknown>;

  /**
   * Copy data.
   *
   * @param data - Data to copy
   * @returns Copied data
   */
  async copy<T>(data: T): Promise<T> {
    const rawData = await this.encode(data);
    const rpcResp = new RpcResponseData(rawData);

    return await this.decode(rpcResp) as T;
  }
}
