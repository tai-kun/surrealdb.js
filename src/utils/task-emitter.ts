import StatefulPromise from "./stateful-promise";
import TaskQueue, { type TaskOptions, type TaskRunnerArgs } from "./task-queue";

interface TypedMap<T> {
  clear(): void;
  delete(key: keyof T): boolean;
  get<TEvent extends keyof T>(key: TEvent): T[TEvent] | undefined;
  set<TEvent extends keyof T>(key: TEvent, value: T[TEvent]): this;
  keys(): IterableIterator<keyof T>;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/)
 */
export type TaskListener<TArgs extends unknown[]> = (
  runnerArgs: TaskRunnerArgs,
  ...args: TArgs
) => void | PromiseLike<void>;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/#once)
 */
export interface TaskListenerOptions extends TaskOptions {}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/)
 */
export default class TaskEmitter<
  TEventMap extends Record<string | number, unknown[]>,
> {
  protected readonly _queue = new TaskQueue();
  protected readonly _listeners = new Map() as TypedMap<
    {
      [P in keyof TEventMap]: {
        original: TaskListener<TEventMap[P]>;
        dispatch: (args: TEventMap[P]) => StatefulPromise<unknown>;
      }[];
    }
  >;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/#on)
   */
  on<TEvent extends keyof TEventMap>(
    this: this,
    event: TEvent,
    listener: TaskListener<TEventMap[TEvent]>,
  ): void {
    let listeners = this._listeners.get(event);

    if (!listeners?.find(({ original }) => original === listener)) {
      if (!listeners) {
        this._listeners.set(event, listeners = []);
      }

      listeners.push({
        original: listener,
        dispatch: args =>
          this._queue.add(rArgs => listener.apply(this, [rArgs, ...args])),
      });
    }
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/#off)
   */
  off<TEvent extends keyof TEventMap>(
    event: TEvent,
    listener?: TaskListener<TEventMap[TEvent]>,
  ): void {
    const listeners = this._listeners.get(event);

    if (listeners) {
      if (listener) {
        const i = listeners.findIndex(({ original }) => original === listener);

        if (i >= 0) {
          listeners.splice(i, 1);

          if (listeners.length === 0) {
            this._listeners.delete(event);
          }
        }
      } else {
        this._listeners.delete(event);
      }
    }
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/#once)
   */
  once<TEvent extends keyof TEventMap>(
    event: TEvent,
    options: TaskListenerOptions | undefined = {},
  ): StatefulPromise<TEventMap[TEvent]> & {
    readonly cancel: () => StatefulPromise<void>;
  } {
    let cancelFn: () => StatefulPromise<void>;
    const promise = new StatefulPromise<TEventMap[TEvent]>(
      (resolve, reject) => {
        const { signal } = options;

        if (signal?.aborted) {
          reject(signal.reason);
          return;
        }

        const removeAllListeners = () => {
          signal?.removeEventListener("abort", abortHandler);
          this.off(event, taskListener);
        };
        const taskListener: TaskListener<TEventMap[TEvent]> = (
          _,
          ...args
        ) => {
          removeAllListeners();
          resolve(args);
        };
        const abortHandler = () => {
          this.off(event, taskListener);
          reject(signal!.reason);
        };
        cancelFn = function cancel(
          this: StatefulPromise<TEventMap[TEvent]>,
        ) {
          removeAllListeners();

          if (this.state === "pending") {
            reject("canceled");
          }

          return this.then(() => {}, () => {});
        };

        try {
          this.on(event, taskListener);
          signal?.addEventListener("abort", abortHandler, { once: true });
        } catch (e) {
          try {
            signal?.removeEventListener("abort", abortHandler);
          } catch {}

          try {
            this.off(event, taskListener);
          } catch {}

          reject(e);
        }
      },
    );

    return Object.assign(promise, {
      cancel: cancelFn!.bind(promise),
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/#emit)
   */
  emit<TEvent extends keyof TEventMap>(
    event: TEvent,
    ...args: TEventMap[TEvent]
  ): undefined | StatefulPromise<unknown>[] {
    const listeners = this._listeners.get(event);

    return listeners
      // コピーしないと .once() 内で this.off() が呼ばれたとき this._listeners が変更される
      // ので、一部のイベントリスナーが呼び出されなかったり、残留しなかったりする。
      && listeners.slice().map(({ dispatch }) => dispatch(args));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/#idle)
   */
  idle(): StatefulPromise<void> {
    return this._queue.idle();
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-emitter/#abort)
   */
  abort(reason?: unknown): void {
    this._queue.abort(reason);
  }
}
