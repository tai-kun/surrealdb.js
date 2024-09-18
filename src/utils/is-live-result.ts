import type { LiveResult } from "@tai-kun/surrealdb/types";

export default function isLiveResult(res: unknown): res is LiveResult {
  // null ではない オブジェクトでなければならない。
  if (!res || typeof res !== "object") {
    return false;
  }

  return typeof res === "object" // Object | Map
    && res !== null
    // id
    && "id" in res
    && isStringOrInstanceLike(res.id) // string | Uuid
    // action
    && "action" in res
    && (res.action === "CREATE"
      || res.action === "UPDATE"
      || res.action === "DELETE")
    // record
    && "record" in res
    && isStringOrInstanceLike(res.record) // string | Thing
    // result
    && "result" in res
    && typeof res.result === "object" // Object | Map | Array | Set
    && res.result !== null;
}

function isStringOrInstanceLike(thing: unknown): thing is string | object {
  return (typeof thing === "object" && thing !== null)
    || typeof thing === "string";
}
