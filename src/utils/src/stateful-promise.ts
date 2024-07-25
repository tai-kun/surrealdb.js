import type { Promisable } from "./types";

export type StatefulPromiseState = "pending" | "fulfilled" | "rejected";

export type StatefulPromiseExecutor<T> = (
  resolve: (value: Promisable<T>) => void,
  reject: (reason: unknown) => void,
) => void;

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/)
 */
export default class StatefulPromise<T> implements PromiseLike<T> {
  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#resolve-)
   */
  static resolve<T = void>(value?: Promisable<T>) {
    if (value && typeof value === "object" && value.constructor === this) {
      return value as never;
    }

    return new this<T>(resolve => resolve(value!));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#reject-)
   */
  static reject<T = never>(reason?: unknown): StatefulPromise<T> {
    return new this<T>((_, reject) => reject(reason));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#withresolvers-)
   */
  static withResolvers<T>(): {
    promise: StatefulPromise<T>;
    resolve: (value: Promisable<T>) => void;
    reject: (reason: unknown) => void;
  } {
    let resolve: (value: Promisable<T>) => void;
    let reject: (reason: unknown) => void;
    const promise = new this<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return {
      promise,
      resolve: resolve!,
      reject: reject!,
    };
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#try-)
   */
  static try<T, A extends readonly unknown[]>(
    func: (...args: A) => Promisable<T>,
    ...args: A
  ): StatefulPromise<T> {
    return new this<T>((resolve, reject) => {
      try {
        resolve(func(...args));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#allrejected-)
   */
  static allRejected(promises: Iterable<unknown>): StatefulPromise<unknown[]>;

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#allrejected-)
   */
  static allRejected<T>(
    promises: Iterable<T>,
    extract: (item: T) => unknown,
  ): StatefulPromise<unknown[]>;

  static allRejected(
    promises: Iterable<unknown>,
    extract: (item: unknown) => unknown = x => x,
  ): StatefulPromise<unknown[]> {
    return new this<unknown[]>(resolve => {
      const items = Array.from(promises);

      if (items.length <= 0) {
        return resolve([]);
      }

      const errors: unknown[] = [];
      let remaining = items.length;

      for (let i = 0, len = items.length; i < len; i++) {
        tick(extract(items[i]));
      }

      function tick(item?: unknown): void {
        if (item instanceof StatefulPromise) {
          item.then(tick, e => errors.push(e) && tick());
        } else if (--remaining <= 0) {
          resolve(errors);
        }
      }
    });
  }

  protected _value: any;
  protected _state: StatefulPromiseState = "pending";
  protected _promise: Promise<void> | null;

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#constructor)
   */
  constructor(executor: StatefulPromiseExecutor<T>) {
    this._promise = new Promise<void>(resolve => {
      executor(
        value => {
          this._value = value;
          this._state = "fulfilled";
          resolve();
        },
        reason => {
          this._value = reason;
          this._state = "rejected";
          resolve();
        },
      );
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#state--)
   */
  get state(): StatefulPromiseState {
    return this._state;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/stateful-promise/#then-)
   */
  then<R1 = T, R2 = never>(
    onFulfilled?: ((value: T) => Promisable<R1>) | undefined | null,
    onRejected?: ((reason: unknown) => Promisable<R2>) | undefined | null,
  ): StatefulPromise<R1 | R2> {
    const This = this.constructor as typeof StatefulPromise<R1 | R2>;

    return new This((resolve, reject) => {
      (this._promise || Promise.resolve())
        .then(() => {
          // 不要になった Promise オブジェクトが GC によってメモリから開放されることを促すために、
          // `this._promise` を `null` に設定します。
          this._promise = null;
          onFulfilled ||= x => x as any;
          onRejected ||= x => {
            throw x;
          };

          return this._state === "fulfilled"
            ? onFulfilled(this._value)
            : onRejected(this._value);
        })
        .then(resolve, reject);
    });
  }
}
