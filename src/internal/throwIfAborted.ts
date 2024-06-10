/**
 * シグナルが中止されている場合に例外を投げる。
 *
 * @param signal - 中止シグナル。
 * @see https://caniuse.com/?search=throwIfAborted
 * @see https://github.com/nodejs/node/blob/v22.2.0/lib/internal/abort_controller.js#L187-L192
 */
export default function throwIfAborted(
  signal: AbortSignal | null | undefined,
): void {
  if (signal != null && signal.aborted) {
    throw signal.reason;
  }
}
