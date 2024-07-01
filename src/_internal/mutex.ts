import { SurrealTypeError } from "~/errors";

const MUTEX_QUEUE = Symbol();

/**
 * ステージ 3 のデコレーターのコンテキスト。
 */
export interface ClassMethodDecoratorContext {
  // kind: string;
  // name: string | symbol;
  // access: {
  //   get?(): unknown;
  //   set?(value: unknown): void;
  // };
  // private?: boolean;
  // static?: boolean;
  /**
   * クラスを初期化する際に実行する関数を追加します。
   *
   * @param initializer 初期化関数。
   */
  addInitializer(initializer: (this: any) => void): void;
}

/**
 * 同時実行性 1 で非同期関数を実行します。
 * ステージ 3 のデコレーターのサポートが必要です。
 *
 * @template T クラスのメソッドの型。
 * @param target クラスのメソッド。
 * @param context ステージ 3 のデコレーターのコンテキスト。
 * @returns ラップされたメソッド。
 * @example
 * ```ts
 * class Example {
 *   @mutex
 *   async connect(url: URL): Promise<void> {
 *     // ...
 *   }
 *
 *   @mutex
 *   async disconnect(): Promise<void> {
 *     // ...
 *   }
 * }
 * ```
 */
export default function mutex<T extends (...args: any) => PromiseLike<any>>(
  target: T,
  context: ClassMethodDecoratorContext,
): (this: any, ...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  if (typeof context.addInitializer !== "function") {
    throw new SurrealTypeError("Requires Stage 3 decorator support.");
  }

  context.addInitializer(function(this: any) {
    if (!this[MUTEX_QUEUE]) {
      Object.defineProperty(this, MUTEX_QUEUE, {
        enumerable: false,
        writable: false,
        value: [],
      });
    }
  });

  return function(...args) {
    let queue: (() => void)[] = this[MUTEX_QUEUE],
      promise: Promise<void>,
      resolve: () => void,
      dequeue = () => queue.shift()?.();

    if (queue.length) {
      ({ promise, resolve } = Promise.withResolvers<void>());
      queue.push(resolve);
    } else {
      // キューが空の場合は後続のタスクが上の条件に入ることができるように queue に dequeue を追加。
      // dequeue は Promise の解決後にも呼び出されるが、2 回連続で dequeue を呼び出すことで、
      // 後続のタスクを実行することができる。
      promise = Promise.resolve();
      queue.push(dequeue);
    }

    return promise
      .then(async () => await target.apply(this, args))
      .finally(dequeue);
  };
}
