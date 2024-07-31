import { UnsupportedRuntimeError } from "@tai-kun/surrealdb/errors";

const MUTEX_QUEUE = /* @__PURE__ */ Symbol();

export default function mutex<T extends (...args: any) => PromiseLike<any>>(
  target: T,
  context: ClassMethodDecoratorContext,
): (
  this: any,
  ...args: Parameters<T>
) => Promise<Awaited<ReturnType<T>>> {
  if (
    context
    && typeof context === "object"
    && typeof context.addInitializer !== "function"
  ) {
    throw new UnsupportedRuntimeError("Requires Stage 3 decorator support.");
  }

  context.addInitializer(function(this: any) {
    if (!this[MUTEX_QUEUE]) {
      Object.defineProperty(this, MUTEX_QUEUE, { value: [] });
    }
  });

  return function(...args) {
    let queue: (() => void)[] = this[MUTEX_QUEUE],
      promise: Promise<void>,
      resolve: () => void,
      dequeue = () => queue.shift()?.();

    if (queue.length) {
      promise = new Promise(arg0 => {
        resolve = arg0;
      });
      queue.push(resolve!);
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
