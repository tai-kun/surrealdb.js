/**
 * id をエスケープします。
 *
 * @param ident - エスケープする id。
 * @returns エスケープされた id。
 * @see https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/escape.rs#L90-L93
 */
export function escapeIdent(rid: string) {
  const escaped = () => "⟨" + rid.replaceAll("⟩", "\⟩") + "⟩";

  if (rid === "") {
    return escaped();
  }

  let numericOnly = true;

  for (
    let i = 0,
      len = rid.length,
      code: number;
    i < len;
    i++
  ) {
    code = rid.charCodeAt(i);

    // numric (0-9)
    if (code > 47 && code < 58) {
      continue;
    }

    if (
      code > 64 && code < 91 // upper alpha (A-Z)
      || code > 96 && code < 123 // lower alpha (a-z)
      || code === 95 // underscore (_)
    ) {
      numericOnly = false;
      continue;
    }

    return escaped();
  }

  if (numericOnly) {
    return escaped();
  }

  return rid;
}
