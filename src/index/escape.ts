export const SINGLE = "'";

export const BRACKETL = "⟨";
export const BRACKETR = "⟩";
export const BRACKET_ESC = "\⟩";

// dprint-ignore
export const DOUBLE = '"';
// dprint-ignore
export const DOUBLE_ESC = '\"';

export const BACKTICK = "`";
export const BACKTICK_ESC = "\`";

/**
 * アンダースコア (`_`) の ASCII コード。
 */
const UNDERSCORE = 95;

const isAsciiDigit = (code: number) => 48 <= code && code <= 57; // 0-9

const isAsciiAlpha = (code: number) =>
  (65 <= code && code <= 90) // A-Z
  || (97 <= code && code <= 122); // a-z

/**
 * 与えられた ASCII コードが数字かアルファベットかを判定します。
 *
 * @param code - ASCII コード。
 * @returns 数字かアルファベットの場合は `true`、それ以外の場合は `false`。
 */
const isAsciiAlphaNumeric = (code: number) =>
  isAsciiDigit(code)
  || isAsciiAlpha(code);

function* matchIndices(
  text: string,
  pattern: (part: string, index: number) => boolean,
): Generator<[number, string]> {
  for (
    let i = 0,
      j: number,
      len = text.length,
      part: string;
    i < len;
    i++
  ) {
    for (j = i + 1; j <= len; j++) {
      if (pattern(part = text.slice(i, j), i)) {
        yield [i, part];
      }
    }
  }
}

/**
 * 文字列を囲います。
 *
 * @param str - 囲む文字列。
 * @param left - 左側の文字。
 * @param right - 右側の文字。
 * @param escaped - エスケープする文字。
 * @returns 囲まれた文字列。
 * @example
 * ```ts
 * escape("foo", "'", "'", "''"); // 'foo'
 * escape("foo'bar", "'", "'", "''"); // 'foo''bar'
 * ```
 */
export function escape(
  str: string,
  left: string,
  right: string,
  escaped: string,
) {
  return left + str.replaceAll(right, escaped) + right;
}

/**
 * 文字列を引用符で囲います。
 *
 * @param str - 囲む文字列。
 * @returns 引用符で囲まれた文字列。
 * @example
 * ```ts
 * quoteStr("cat"); // 'cat'
 * quoteStr("cat's"); // "cat's"
 * quoteStr(`cat's "toy"`); // "cat's \"toy\""
 * ```
 */
// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L22-L52
export function quoteStr(str: string): string {
  function escapeInto(s: string, escapeDouble: boolean) {
    let into = "",
      lastEnd = 0;

    for (
      const [start, part] of matchIndices(
        s,
        c => c === "\\" || (c === DOUBLE && escapeDouble),
      )
    ) {
      into += s.slice(lastEnd, start);
      into += part === "\\"
        ? "\\\\"
        : DOUBLE_ESC;
      lastEnd = start + part.length;
    }

    into += s.slice(lastEnd);

    return into;
  }

  const quote = str.indexOf(SINGLE) !== -1
    ? DOUBLE
    : SINGLE;

  return quote
    + escapeInto(str, quote === DOUBLE)
    + quote;
}

/**
 * オブジェクトのキーをエスケープします。
 *
 * @param str - エスケープする文字列。
 * @returns エスケープされた文字列。
 * @example
 * ```ts
 * escapeKey("123"); // 123
 * escapeKey("foo_bar"); // foo_bar
 * escapeKey("foo-bar"); // "foo-bar"
 * escapeKey(`ehco "hello"`); // "ehco \"hello\""
 * ```
 */
// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L85-L87
export function escapeKey(str: string): string {
  return escapeNormal(str, DOUBLE, DOUBLE, DOUBLE_ESC);
}

/**
 * レコード ID をエスケープします。
 *
 * @param str - エスケープする文字列。
 * @returns エスケープされた文字列。
 * @example
 * ```ts
 * escapeRid("123"); // ⟨123⟩
 * escapeRid("foo_bar"); // foo_bar
 * escapeRid("foo-bar"); // ⟨foo-bar⟩
 * escapeRid(`ehco ⟩`); // ⟨ehco \⟩⟩
 * ```
 */
// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L91-L93
export function escapeRid(str: string): string {
  return escapeNumeric(str, BRACKETL, BRACKETR, BRACKET_ESC);
}

/**
 * 識別子をエスケープします。
 *
 * @param str - エスケープする文字列。
 * @returns エスケープされた文字列。
 * @example
 * ```ts
 * escapeIdent("123"); // `123`
 * escapeIdent("foo_bar"); // foo_bar
 * escapeIdent("foo-bar"); // `foo-bar`
 * escapeIdent("ehco `hello`"); // `ehco \`hello\``
 * ```
 */
// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L97-L103
export function escapeIdent(str: string): string {
  return escapeNumeric(str, BACKTICK, BACKTICK, BACKTICK_ESC);
}

/**
 * 通常の文字列をエスケープします。
 *
 * @param str - エスケープする文字列。
 * @returns エスケープされた文字列。
 * @example
 * ```ts
 * escapeNormal("123", "'", "'", "''"); // 123
 * escapeNormal("foo_bar", "'", "'", "''"); // foo_bar
 * escapeNormal("foo-bar", "'", "'", "''"); // 'foo-bar'
 * escapeNormal("foo'bar", "'", "'", "''"); // 'foo''bar'
 * ```
 */
// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L106-L116
export function escapeNormal(
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

/**
 * 数値もエスケープします。
 *
 * @param str - エスケープする文字列。
 * @returns エスケープされた文字列。
 * @example
 * ```ts
 * escapeNumeric("123", "'", "'", "''"); // '123'
 * escapeNumeric("foo_bar", "'", "'", "''"); // foo_bar
 * escapeNumeric("foo-bar", "'", "'", "''"); // 'foo-bar'
 * escapeNumeric("foo'bar", "'", "'", "''"); // 'foo''bar'
 * ```
 */
// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L120-L141
export function escapeNumeric(
  str: string,
  left: string,
  right: string,
  escaped: string,
): string {
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
