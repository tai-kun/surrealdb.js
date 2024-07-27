import { getFloat16 as get, setFloat16 as set } from "@petamoriken/float16";

export function setFloat16(
  view: DataView,
  offset: number,
  value: number,
): void {
  set(view, offset, value);
}

export function getFloat16(view: DataView, offset: number): number {
  return get(view, offset);

  // https://www.rfc-editor.org/rfc/rfc8949.html#name-half-precision
  // の JavaScript バージョン:

  // function ldexp(mantissa: number, exponent: number): number {
  //   return mantissa * Math.pow(2, exponent);
  // }

  // const half = (bytes[offset]! << 8) + bytes[offset + 1]!;
  // const exp = (half >> 10) & 0x1f;
  // const mant = half & 0x3ff;
  // const value = exp === 0
  //   ? ldexp(mant, -24)
  //   : exp !== 31
  //   ? ldexp(mant + 1024, exp - 25)
  //   : mant === 0
  //   ? Infinity
  //   : NaN;

  // return half & 0x8000
  //   ? -value
  //   : value;
}
