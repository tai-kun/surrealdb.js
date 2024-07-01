import type { JsonValue } from "type-fest";
import type Payload from "./Payload";
import type { Formatter } from "./types";

const jsonFormatter: Formatter = {
  mimeType: "application/json",
  encode(data: unknown): string {
    return JSON.stringify(data);
  },
  async decode(payload: Payload): Promise<JsonValue> {
    return JSON.parse(await payload.text());
  },
};

export default jsonFormatter;
