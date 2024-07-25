const toString = Object.prototype.toString;

export default function isArrayBuffer(value: unknown): value is ArrayBuffer {
  // Firefox では fetch のレスポンスボディーを ArrayBuffer にしたときにそれを instanceof
  // で判定できないようなので、タグ名で判定する。
  return toString.call(value) === "[object ArrayBuffer]";
}
