/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/utils/throw-if-aborted/)
 */
export default function throwIfAborted(
  signal: AbortSignal | null | undefined,
): void {
  if (signal != null && signal.aborted) {
    throw signal.reason;
  }
}
