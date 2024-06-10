import { UnsupportedRuntime } from "../errors";
import isBrowser from "./isBrowser";

/**
 * 指定されたミリ秒数後にタイムアウトする `AbortSignal` を返します。
 *
 * @param milliseconds - タイムアウトするまでのミリ秒数。
 * @see https://caniuse.com/mdn-api_abortsignal_timeout_static
 * @see https://github.com/nodejs/node/blob/v22.2.0/lib/internal/abort_controller.js#L209-L221
 */
export default function timeoutSignal(milliseconds: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(milliseconds);
  }

  if (isBrowser) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => {
        const reason = new DOMException("signal timed out", "TimeoutError");
        controller.abort(reason);
      },
      milliseconds,
    );
    controller.signal.addEventListener("abort", () => clearTimeout(timeoutId));

    return controller.signal;
  }

  // ブラウザ以外の環境では setTimeout の unref や FinalizationRegistry が必要になるため、
  // ポリフィルの実装コストが高い。`.timeout()` が無ければ諦めてエラーを投げる。
  throw new UnsupportedRuntime("AbortSignal.timeout() is not supported.");
}
