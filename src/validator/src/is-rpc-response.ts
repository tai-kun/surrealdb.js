import type { RpcResponse } from "@tai-kun/surrealdb/types";

export default function isRpcResponse(resp: unknown): resp is RpcResponse {
  // null ではない オブジェクトでなければならない。
  if (!resp || typeof resp !== "object") {
    return false;
  }

  // `id` プロパティーがあるなら、それは文字列でなければならない。
  if ("id" in resp && typeof resp["id"] !== "string") {
    return false;
  }

  // `result` プロパティーがあるなら、`error` プロパティーを持っていてはならない。
  if ("result" in resp) {
    return !("error" in resp);
  }

  // `error` プロパティーがあるなら、それは数値を持つ `code` と文字列を持つ `message`
  // プロパティーで構成されたオブジェクトでなければならない。
  return "error" in resp
    && !!resp.error
    && typeof resp.error === "object"
    && "code" in resp.error
    && "message" in resp.error
    && typeof resp.error.code === "number"
    && typeof resp.error.message === "string";
}
