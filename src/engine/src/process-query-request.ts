import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import type { RpcQueryRequest } from "@tai-kun/surrealdb/types";

export default function processQueryRequest(request: RpcQueryRequest): {
  method: "query";
  params: [text: string, vars: { [p: string]: unknown }];
} {
  const [arg0, args] = request.params;
  const {
    text,
    vars: preparedVars,
    slots,
  } = typeof arg0 === "string"
    ? { text: arg0, vars: {}, slots: [] }
    : arg0;
  const vars = { ...args };
  const required: string[] = [];

  for (const slot of slots) {
    if (slot.isRequired) {
      if (!(slot.name in vars)) {
        required.push(slot.name);
      }
    } else if (!(slot.name in vars) && "defaultValue" in slot) {
      vars[slot.name] = slot.defaultValue;
    }
  }

  if (required.length > 0) {
    throw new SurrealTypeError(
      `variables containing key(s) ${slots.map(slot => slot.name)}`,
      `without key(s) ${required}`,
    );
  }

  return {
    method: request.method,
    params: [text, { ...preparedVars, ...vars }],
  };
}
