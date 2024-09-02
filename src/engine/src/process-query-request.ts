import { SurrealValueError } from "@tai-kun/surrealdb/errors";
import type {
  PreparedQueryLike,
  RpcQueryRequest,
} from "@tai-kun/surrealdb/types";

export default function processQueryRequest(request: RpcQueryRequest): {
  method: "query";
  params: [
    text: PreparedQueryLike["text"],
    vars: {
      readonly [p: string]: unknown;
    },
  ];
} {
  const [arg0, args] = request.params;
  const {
    text,
    vars: preparedVars,
    slots,
  } = typeof arg0 === "string"
    ? { text: arg0, vars: {}, slots: [] }
    : arg0;
  const vars = Object.assign({}, args) as { [p: string]: unknown };
  const required: string[] = [];

  for (const slot of slots) {
    if (slot.name in vars) {
      vars[slot.name] = slot._parse(vars[slot.name]);
    } else if (slot.isRequired) {
      required.push(slot.name);
    } else if ("defaultValue" in slot) {
      vars[slot.name] = slot.defaultValue;
    }
  }

  if (required.length > 0) {
    throw new SurrealValueError(
      `variables containing key(s) ${slots.map(slot => slot.name)}`,
      `without key(s) ${required}`,
    );
  }

  return {
    method: request.method,
    params: [text, Object.assign({}, preparedVars, vars)],
  };
}
