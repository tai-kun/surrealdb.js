/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#state)
 */
export type StatefulPromiseState = "pending" | "fulfilled" | "rejected";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#constructor)
 */
export type StatefulPromiseExecutor<TValue> = (
  resolve: (value: TValue | PromiseLike<TValue>) => void,
  reject: (reason: unknown) => void,
) => void;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/)
 */
export default class StatefulPromise<TValue> implements PromiseLike<TValue> {
  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#resolve)
   */
  static resolve<TValue = void>(value?: TValue | PromiseLike<TValue>) {
    if (value && typeof value === "object" && value.constructor === this) {
      return value as never;
    }

    return new this<TValue>(resolve => resolve(value!));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#reject)
   */
  static reject<TValue = never>(reason?: unknown): StatefulPromise<TValue> {
    return new this<TValue>((_, reject) => reject(reason));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#withresolvers)
   */
  static withResolvers<TValue>(): {
    promise: StatefulPromise<TValue>;
    resolve: (value: TValue | PromiseLike<TValue>) => void;
    reject: (reason: unknown) => void;
  } {
    let resolve: (value: TValue | PromiseLike<TValue>) => void;
    let reject: (reason: unknown) => void;
    const promise = new this<TValue>((res, rej) => {
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
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#try)
   */
  static try<TValue, TArgs extends readonly unknown[]>(
    func: (...args: TArgs) => TValue | PromiseLike<TValue>,
    ...args: TArgs
  ): StatefulPromise<TValue> {
    return new this<TValue>((resolve, reject) => {
      try {
        resolve(func(...args));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#allrejected)
   */
  static allRejected(promises: Iterable<unknown>): StatefulPromise<unknown[]>;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#allrejected)
   */
  static allRejected<TItem>(
    promises: Iterable<TItem>,
    extract: (item: TItem) => unknown,
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
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#constructor)
   */
  constructor(executor: StatefulPromiseExecutor<TValue>) {
    this._promise = new Promise<TValue>(executor).then(
      value => {
        this._value = value;
        this._state = "fulfilled";
      },
      reason => {
        this._value = reason;
        this._state = "rejected";
      },
    );
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#state)
   */
  get state(): StatefulPromiseState {
    return this._state;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/stateful-promise/#then)
   */
  then<TFulfilledValue = TValue, TRejectedValue = never>(
    onFulfilled?:
      | ((value: TValue) => TFulfilledValue | PromiseLike<TFulfilledValue>)
      | undefined
      | null,
    onRejected?:
      | ((reason: unknown) => TRejectedValue | PromiseLike<TRejectedValue>)
      | undefined
      | null,
  ): StatefulPromise<TFulfilledValue | TRejectedValue> {
    const This = this.constructor as typeof StatefulPromise<
      TFulfilledValue | TRejectedValue
    >;

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

  get [Symbol.toStringTag](): string {
    return "StatefulPromise";
  }
}
