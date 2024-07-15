/**
 * バイトから 16 進数への変換テーブル。
 *
 * ```ts
 * [
 *   "00", // byteToHex[0]
 *   "01", // byteToHex[1]
 *   ...
 *   "fe", // byteToHex[254]
 *   "ff", // byteToHex[255]
 * ]
 * ```
 *
 * @internal
 */
export const byteToHex = /* @__PURE__ */ Array.from(
  { length: 256 },
  (_, i) => (i + 0x100).toString(16).slice(1),
);

/**
 * バイト配列が有効な UUID かどうかを判定します。
 *
 * @param bytes バイト配列。
 * @returns 有効な UUID なら `true`、そうでなければ `false`。
 */
export function isValidBytes(bytes: Uint8Array): boolean {
  let v;

  return bytes.length === 16 && (
    (
      // regex: [1-7]
      ((v = bytes[6]! >> 4) === 1 || v === 2 || v === 3 || v === 4 || v === 5
        || v === 6 || v === 7)
      // regex: [89ab]
      && ((v = bytes[8]! >> 4) === 8 || v === 9 || v === 10 || v === 11)
    )
    || bytes.every(b => b === 0x00)
    || bytes.every(b => b === 0xff)
  );
}
