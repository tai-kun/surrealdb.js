export function isValidBytes(bytes: Uint8Array): boolean {
  let v: number;

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
