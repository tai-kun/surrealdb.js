/**
 * Creates an AbortSignal object and an associated abort function.
 *
 * @param signal - The optional AbortSignal object to associate with the api.
 * @returns The AbortSignal object and the abort function.
 * @example
 * ```ts
 * const [signal, abort] = makeAbortApi();
 * abort("reason");
 * ```
 * @example
 * ```ts
 * const ac = new AbortController();
 * const [signal] = makeAbortApi(ac.signal);
 * ac.abort("reason");
 * ```
 * @example
 * ```ts
 * const ac = new AbortController();
 * ac.abort();
 * makeAbortApi(ac.signal); // Throws an error.
 * ```
 */
export function makeAbortApi(signal?: AbortSignal | undefined): [
  signal: AbortSignal,
  abort: {
    /**
     * Invoking this function will set this object's AbortSignal's aborted flag
     * and signal to any observers that the associated activity is to be aborted.
     *
     * @param reason - The reason for aborting the task.
     */
    (reason?: unknown): void;
  },
] {
  signal?.throwIfAborted();
  const ac = new AbortController();

  function abort(reason?: unknown): void {
    signal?.removeEventListener("abort", handleAbort);

    if (!ac.signal.aborted) {
      ac.abort(reason);
    }
  }

  function handleAbort(): void {
    abort(signal!.reason);
  }

  signal?.addEventListener("abort", handleAbort);

  return [ac.signal, abort];
}
