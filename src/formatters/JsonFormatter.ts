import Abc from "./Abc";
import type Payload from "./Payload";

/**
 * JSON データのシリアライザーとデシリアライザー。
 */
export default class JsonFormatter extends Abc {
  constructor() {
    super("application/json");
  }

  encode(data: unknown): string {
    return JSON.stringify(data);
  }

  async decode(payload: Payload): Promise<unknown> {
    return JSON.parse(await payload.text());
  }
}
