import type { Promisable } from "type-fest";

/**
 * The state of the stateful-promise.
 */
export type StatefulPromiseState = "pending" | "fulfilled" | "rejected";

/**
 * A promise executor.
 *
 * @template T - The type of the result of the promise.
 * @param resolve - The function to call when the promise is resolved.
 * @param reject - The function to call when the promise is rejected.
 */
export type StatefulPromiseExecutor<T> = (
  resolve: (value: Promisable<T>) => void,
  reject: (reason: unknown) => void,
) => void;

/**
 * This Promise never rejects; instead, it resolves with a state and its result.
 *
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
export class StatefulPromise<T> implements PromiseLike<T> {
  /**
   * Creates a new rejected promise for the provided reason.
   *
   * @template T - The type of the value.
   * @param reason - The reason the stateful-promise was rejected.
   * @returns A new rejected StatefulPromise.
   */
  static reject<T = never>(reason?: unknown): StatefulPromise<T> {
    return new StatefulPromise<T>((_, reject) => reject(reason));
  }

  /**
   * Creates a new Promise and returns it in an object, along with its resolve
   * and reject functions.
   *
   * @template T - The type of the value.
   * @returns An object with the properties `promise`, `resolve`, and `reject`.
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
   * @template T - The type of the result of the promise.
   * @param executor - The promise executor.
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
   * The state of the stateful-promise.
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
      // The garbage collection function prevents used a `Promise` object
      // from unnecessarily remaining in memory.
      this.#promise = null;
    }

    return this.#state === "fulfilled"
      ? (onfulfilled ? onfulfilled(this.#value) : this.#value)
      : (onrejected ? onrejected(this.#value) : Promise.reject(this.#value));
  }
}
