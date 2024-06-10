const toString = Object.prototype.toString;

/**
 * ArrayBuffer かどうか判定します。
 *
 * @param value 判定する値。
 * @returns ArrayBuffer であれば true、それ以外は false。
 */
export default (value: unknown): value is ArrayBuffer =>
  value instanceof ArrayBuffer
  // Firefox では ArrayBuffer のインスタンスを instanceof で判定できない。
  // ただメソッドは備えているようなので、タグ名で判定する。
  || toString.call(value) === "[object ArrayBuffer]";
