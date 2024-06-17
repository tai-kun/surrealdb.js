import escapeNumeric from "./escapeNumeric";

export const BACKTICK = "`";
export const BACKTICK_ESC = "\`";

// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L97-L103
export default function escapeIdent(str: string): string {
  return escapeNumeric(str, BACKTICK, BACKTICK, BACKTICK_ESC);
}
