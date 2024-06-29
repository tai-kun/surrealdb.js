import type { Promisable } from "type-fest";

/**
 * ステートフル Promise 状態を表す文字列。
 */
export type StatefulPromiseState = "pending" | "fulfilled" | "rejected";

/**
 * ステートフル Promise の実行関数。
 *
 * @template T - Promise の結果の型。
 * @param resolve - Promise が解決されたときに呼び出す関数。
 * @param reject - Promise が拒否されたときに呼び出す関数。
 */
export type StatefulPromiseExecutor<T> = (
  resolve: (value: Promisable<T>) => void,
  reject: (reason: unknown) => void,
) => void;

/**
 * この Promise は決して拒否しませんが、代わりに状態とその結果で解決します。
 * `await` すると、状態が解決されるまで待機し、拒否された場合は例外を投げます。
 * Promise をハンドリングしていない場合、拒否されてもその場で例外を投げることはありません。
 *
 * @template T - Promise の結果の型。
 * @example
 * ```ts
 * const promise = new StatefulPromise(resolve => {
 *   setTimeout(() => resolve("test"), 1_000);
 * });
 *
 * console.log(promise.state); // "pending"
 *
 * const result = await promise;
 *
 * console.log(result); // "test"
 * console.log(promise.state); // "fulfilled"
 * ```
 */
export default class StatefulPromise<T> implements PromiseLike<T> {
  /**
   * 拒否理由とともに、新しい拒否された Promise を作成します。
   *
   * @template T - Promise の結果の型。
   * @param reason - 拒否理由。
   * @returns 新しい拒否された Promise。
   */
  static reject<T = never>(reason?: unknown): StatefulPromise<T> {
    return new StatefulPromise<T>((_, reject) => reject(reason));
  }

  /**
   * Promise とそれを解決または拒否する関数を含むオブジェクトを作成します。
   *
   * @template T - Promise の結果の型。
   * @returns Promise とそれを解決または拒否する関数を含むオブジェクト。
   * @example
   * ```ts
   * const { promise, resolve, reject } = StatefulPromise.withResolvers();
   *
   * eventEmitter.once("event", (data, error) => {
   *   if (error) {
   *     reject(error);
   *   } else {
   *     resolve(data);
   *   }
   * });
   *
   * await promise;
   * ```
   */
  static withResolvers<T>(): {
    promise: StatefulPromise<T>;
    resolve: (value: Promisable<T>) => void;
    reject: (reason: unknown) => void;
  } {
    let resolve: (value: Promisable<T>) => void;
    let reject: (reason: unknown) => void;
    const promise = new StatefulPromise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return {
      promise,
      resolve: resolve!,
      reject: reject!,
    };
  }

  #value: any;
  #state: StatefulPromiseState = "pending";
  #promise: Promise<void> | null;

  /**
   * @template T - Promise の結果の型。
   * @param executor - Promise の実行関数。
   */
  constructor(executor: StatefulPromiseExecutor<T>) {
    this.#promise = new Promise<void>(resolve => {
      executor(
        value => {
          this.#value = value;
          this.#state = "fulfilled";
          resolve();
        },
        reason => {
          this.#value = reason;
          this.#state = "rejected";
          resolve();
        },
      );
    });
  }

  /**
   * Promise の現在の状態。
   */
  get state(): StatefulPromiseState {
    return this.#state;
  }

  async then<R1 = T, R2 = never>(
    onfulfilled?: ((value: T) => Promisable<R1>) | undefined | null,
    onrejected?: ((reason: unknown) => Promisable<R2>) | undefined | null,
  ): Promise<R1 | R2> {
    if (this.#state === "pending") {
      await this.#promise;
      // 不要になった Promise オブジェクトが GC によってメモリから開放されることを促すために、
      // `this.#promise` を `null` に設定します。
      this.#promise = null;
    }

    return this.#state === "fulfilled"
      ? (onfulfilled ? onfulfilled(this.#value) : this.#value)
      : (onrejected ? onrejected(this.#value) : Promise.reject(this.#value));
  }
}
