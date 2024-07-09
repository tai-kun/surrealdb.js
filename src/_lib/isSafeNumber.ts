// [...(9007199254740991).toString(8)].map(c => c.charCodeAt(0))
const MAX_SAFE_INTEGER = [
  51,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
  55,
];

const MAX_SAFE_INTEGER_LENGTH = MAX_SAFE_INTEGER.length;

export default function isSafeNumber(value: number): boolean {
  if (
    // https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.isfinite
    // 1. value if not a Number -> false
    // 2. value is not finite -> false
    !Number.isFinite(value)
    // https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.isnan
    // 1. value is not a Number -> false
    // 2. value is NaN -> false
    || value !== value
  ) {
    return false;
  }

  // (1e21).toString(10) -> int = "1e+21"
  // (1e21).toString( 8) -> int = "154327115334273650000000"
  let [int, dec] = value.toString(8).split(".", 2) as [string, string?],
    nChars = int.length,
    cursor = int.charCodeAt(0) === 45 /* "-" */ ? 1 : 0;

  if (nChars - cursor !== MAX_SAFE_INTEGER_LENGTH) {
    return nChars - cursor < MAX_SAFE_INTEGER_LENGTH;
  }

  for (let i = 0, c: number; i < MAX_SAFE_INTEGER_LENGTH; i++, cursor++) {
    if (
      (c = int.charCodeAt(cursor)) >= 48 // 0
      && c <= 55 // 7
    ) {
      if (c < MAX_SAFE_INTEGER[i]!) {
        return true;
      }

      if (c > MAX_SAFE_INTEGER[i]!) {
        return false;
      }
    }
  }

  return !dec;
}
