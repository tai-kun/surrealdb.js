const toString = Object.prototype.toString;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/utils/is-array-buffer/)
 */
export default function isArrayBuffer(value: unknown): value is ArrayBuffer {
  // Firefox では fetch のレスポンスボディーを ArrayBuffer にしたときにそれを instanceof
  // で判定できないようなので、タグ名で判定する。
  return toString.call(value) === "[object ArrayBuffer]";
}
