export default function throwIfAborted(
  signal: AbortSignal | null | undefined,
): void {
  if (signal != null && signal.aborted) {
    throw signal.reason;
  }
}
