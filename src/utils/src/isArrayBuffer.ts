const toString = Object.prototype.toString;

/**
 * ArrayBuffer かどうか判定します。
 *
 * @param value 判定する値。
 * @returns ArrayBuffer であれば true、それ以外は false。
 * @example
 * ```ts
 * const response = await fetch("https://localhost:8000/data");
 * const buffer = await response.arrayBuffer();
 *
 * if (isArrayBuffer(buffer)) {
 *   console.log("レスポンスボディを ArrayBuffer として処理します。");
 * }
 * ```
 */
export default (value: unknown): value is ArrayBuffer =>
  value instanceof ArrayBuffer
  // Firefox では ArrayBuffer のインスタンスを instanceof で判定できない。
  // ただメソッドは備えているようなので、タグ名で判定する。
  || toString.call(value) === "[object ArrayBuffer]";
