// https://github.com/surrealdbdb/surrealdbdb/blob/v2.0.0-alpha.7/core/src/sql/escape.rs

export const BRACKET_L = "⟨";
export const BRACKET_R = "⟩";
const BRACKET_ESC = "\\⟩";

export const BACKTICK = "`";
const BACKTICK_ESC = "\\`";

export const SINGLE_QUOTE = "'";

// dprint-ignore
export const DOUBLE_QUOTE = '"';
// dprint-ignore
const DOUBLE_QUOTE_ESC = '\\"';

const UNDERSCORE = 95; // _

const isAsciiDigit = (code: number) => 48 <= code && code <= 57; // 0-9

const isAsciiAlpha = (code: number) =>
  (65 <= code && code <= 90) // A-Z
  || (97 <= code && code <= 122); // a-z

const isAsciiAlphaNumeric = (code: number) =>
  isAsciiDigit(code)
  || isAsciiAlpha(code);

function escape(
  str: string,
  left: string,
  right: string,
  escaped: string,
) {
  return left + str.replaceAll(right, escaped) + right;
}

function escapeNormal(
  str: string,
  left: string,
  right: string,
  escaped: string,
): string {
  for (let i = 0, len = str.length, code: number; i < len; i++) {
    code = str.charCodeAt(i);

    if (!(isAsciiAlphaNumeric(code) || code === UNDERSCORE)) {
      return escape(str, left, right, escaped);
    }
  }

  return str;
}

function escapeNumeric(
  str: string,
  left: string,
  right: string,
  escaped: string,
): string {
  for (let i = 0, len = str.length, code: number; i < len; i++) {
    code = str.charCodeAt(i);

    if (i <= 0 && isAsciiDigit(code)) {
      return escape(str, left, right, escaped);
    }

    if (!(isAsciiAlphaNumeric(code) || code === UNDERSCORE)) {
      return escape(str, left, right, escaped);
    }
  }

  return str;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/quote-str/)
 */
export function quoteStr(str: string): string {
  if (!str) {
    return SINGLE_QUOTE + SINGLE_QUOTE;
  }

  str = str.replaceAll("\\", "\\\\");

  if (str.indexOf(SINGLE_QUOTE) === -1) {
    return SINGLE_QUOTE
      + str
      + SINGLE_QUOTE;
  } else {
    return DOUBLE_QUOTE
      + str.replaceAll(DOUBLE_QUOTE, DOUBLE_QUOTE_ESC)
      + DOUBLE_QUOTE;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/escape-key/)
 */
export function escapeKey(key: string): string {
  if (!key) {
    return DOUBLE_QUOTE + DOUBLE_QUOTE;
  }

  return escapeNormal(key, DOUBLE_QUOTE, DOUBLE_QUOTE, DOUBLE_QUOTE_ESC);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/escape-rid/)
 */
export function escapeRid(rid: string): string {
  if (!rid) {
    return BRACKET_L + BRACKET_R;
  }

  return escapeNumeric(rid, BRACKET_L, BRACKET_R, BRACKET_ESC);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/escape-ident/)
 */
export function escapeIdent(ident: string): string {
  if (!ident) {
    return BACKTICK + BACKTICK;
  }

  return escapeNumeric(ident, BACKTICK, BACKTICK, BACKTICK_ESC);
}
