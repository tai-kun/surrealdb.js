import type { JsonValue } from "type-fest";
import type { Formatter } from "../../_shared/types";

export default {
  mimeType: "application/json",
  encode(data): string {
    return JSON.stringify(data);
  },
  async decode(payload): Promise<JsonValue> {
    return JSON.parse(await payload.text());
  },
} satisfies Formatter;
