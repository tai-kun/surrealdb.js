import escape from "./escape";

const UNDERSCORE = 95; // _

const isAsciiDigit = (code: number) => 48 <= code && code <= 57; // 0-9

const isAsciiAlpha = (code: number) =>
  (65 <= code && code <= 90) // A-Z
  || (97 <= code && code <= 122); // a-z

const isAsciiAlphaNumeric = (code: number) =>
  isAsciiDigit(code)
  || isAsciiAlpha(code);

export default function escapeNumeric(
  str: string,
  left: string,
  right: string,
  escaped: string,
): string {
  // https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L120-L141

  let numeric = true;

  for (let i = 0, len = str.length, code: number; i < len; i++) {
    code = str.charCodeAt(i);

    if (!(isAsciiAlphaNumeric(code) || code === UNDERSCORE)) {
      return escape(str, left, right, escaped);
    }

    if (!isAsciiDigit(code)) {
      numeric = false;
    }
  }

  if (numeric) {
    return escape(str, left, right, escaped);
  }

  return str;

  // expeirmental-parser
  // https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L150-L163

  // for (let i = 0, len = str.length, code: number; i < len; i++) {
  //   code = str.charCodeAt(i);

  //   if (
  //     (i === 0 && isAsciiDigit(code))
  //     || !(isAsciiAlphaNumeric(code) || code === UNDERSCORE)
  //   ) {
  //     return escape(str, left, right, escaped);
  //   }
  // }

  // return str;
}
