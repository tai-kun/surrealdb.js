import type { RpcResponseData } from "../common/RpcResponseData";
import { Formatter } from "./Formatter";

/**
 * A JSON formatter for encoding and decoding data.
 */
export class JsonFormatter extends Formatter {
  constructor() {
    super("application/json");
  }

  encode(data: unknown): string {
    return JSON.stringify(data);
  }

  async decode(data: RpcResponseData): Promise<unknown> {
    return JSON.parse(await data.text());
  }
}
