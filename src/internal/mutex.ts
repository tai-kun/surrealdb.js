const MUTEX_QUEUE = Symbol();

export interface ClassMethodDecoratorContext {
  // kind: string;
  // name: string | symbol;
  // access: {
  //   get?(): unknown;
  //   set?(value: unknown): void;
  // };
  // private?: boolean;
  // static?: boolean;
  addInitializer(initializer: (this: any) => void): void;
}

/**
 * Runs the asynchronous function with a concurrency of 1.
 *
 * Requires Stage 3 decorator support.
 *
 * @template T - The type of the target function.
 * @param target - The target function to run.
 * @param context - The context of the decorator.
 * @returns The wrapped function.
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
export function mutex<T extends (...args: any) => PromiseLike<any>>(
  target: T,
  context: ClassMethodDecoratorContext,
) {
  if (typeof context.addInitializer !== "function") {
    throw new TypeError("Requires Stage 3 decorator support.");
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

  return function(
    this: any,
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    let queue: (() => void)[] = this[MUTEX_QUEUE],
      promise: Promise<void>,
      resolve: () => void,
      dequeue = () => queue.shift()?.();

    if (queue.length) {
      ({ promise, resolve } = Promise.withResolvers<void>());
      queue.push(resolve);
    } else {
      promise = Promise.resolve();
      queue.push(dequeue);
    }

    return promise
      .then(() => target.apply(this, args))
      .finally(dequeue);
  };
}
