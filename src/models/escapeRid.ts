import escapeNumeric from "./escapeNumeric";

export const BRACKETL = "⟨";
export const BRACKETR = "⟩";
export const BRACKET_ESC = "\⟩";

// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L91-L93
export default function escapeRid(str: string): string {
  return escapeNumeric(str, BRACKETL, BRACKETR, BRACKET_ESC);
}
