import throwIfAborted from "./throw-if-aborted";

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/make-abort-api/)
 */
export default function makeAbortApi(signal?: AbortSignal | undefined): [
  signal: AbortSignal,
  abort: (reason?: unknown) => void,
] {
  throwIfAborted(signal);
  const c = new AbortController();

  function abort(reason?: unknown): void {
    if (signal) {
      signal.removeEventListener("abort", handleAbort);

      if (!signal.aborted) {
        Object.defineProperty(signal, "reason", { value: reason });
        signal.dispatchEvent(new Event("abort"));
      }

      signal = undefined;
    }

    if (!c.signal.aborted) {
      c.abort(reason);
    }
  }

  function handleAbort(): void {
    abort(signal!.reason);
  }

  signal?.addEventListener("abort", handleAbort);

  return [c.signal, abort];
}
