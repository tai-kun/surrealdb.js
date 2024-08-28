import type { LiveResult } from "@tai-kun/surrealdb/types";

export default function isLiveResult(res: unknown): res is LiveResult {
  // null ではない オブジェクトでなければならない。
  if (!res || typeof res !== "object") {
    return false;
  }

  return !!res
    && typeof res === "object"
    && "id" in res
    && "action" in res
    && "result" in res
    && (res.action === "CREATE"
      || res.action === "UPDATE"
      || res.action === "DELETE");
  // && (
  //   ((res.action === "CREATE" || res.action === "UPDATE")
  //     && Array.isArray(res.result))
  //   || (res.action === "DELETE"
  //     && !!res.result
  //     && typeof res.result === "object")
  // );
}
