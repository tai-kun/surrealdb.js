import throwIfAborted from "./throwIfAborted";

/**
 * 中止シグナルと、それに関連付けられた中止関数を作成します。
 *
 * @param signal この API に関連付けるオプションの中止シグナル。
 * @returns 中止シグナルと中止関数。
 * @example
 * ```ts
 * const [signal, abort] = makeAbortApi();
 * abort("reason");
 * ```
 * @example
 * ```ts
 * const controller = new AbortController();
 * const [signal] = makeAbortApi(controller.signal);
 * controller.abort("reason");
 * ```
 * @example
 * ```ts
 * const controller = new AbortController();
 * controller.abort();
 * makeAbortApi(controller.signal); // Throws an error.
 * ```
 */
export default function makeAbortApi(signal?: AbortSignal | undefined): [
  signal: AbortSignal,
  abort: {
    /**
     * この関数を呼び出すと、このオブジェクトの AbortSignal の中止フラグが設定され、
     * 関連するアクティビティが中止されることをすべてのオブザーバーに通知します。
     *
     * @param reason -　中止の理由。
     */
    (reason?: unknown): void;
  },
] {
  throwIfAborted(signal);
  const controller = new AbortController();

  function abort(reason?: unknown): void {
    signal?.removeEventListener("abort", handleAbort);

    if (!controller.signal.aborted) {
      controller.abort(reason);
    }
  }

  function handleAbort(): void {
    abort(signal!.reason);
  }

  signal?.addEventListener("abort", handleAbort);

  return [controller.signal, abort];
}
