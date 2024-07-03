/**
 * シグナルが中止されている場合に例外を投げます。
 * この関数は AbortSignal のインスタンスに `.throwIfAborted()` メソッドが実装されていない環境で使用されるために提供されています。
 *
 * @param signal 中止シグナル。
 * @see https://caniuse.com/?search=throwIfAborted
 * @see https://github.com/nodejs/node/blob/v22.2.0/lib/internal/abort_controller.js#L187-L192
 * @example
 * ```ts
 * function fetchData(signal: AbortSignal) {
 *   throwIfAborted(signal);
 *   const resp = await fetch("https://localhost:8000/data", { signal });
 *
 *   return await resp.json();
 * }
 * ```
 */
export default function throwIfAborted(
  signal: AbortSignal | null | undefined,
): void {
  if (signal != null && signal.aborted) {
    throw signal.reason;
  }
}
