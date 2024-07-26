import StatefulPromise from "./stateful-promise";
import TaskQueue, { type TaskOptions, type TaskRunnerArgs } from "./task-queue";

interface TypedMap<T> {
  clear(): void;
  delete(key: keyof T): boolean;
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K]): this;
  keys(): IterableIterator<keyof T>;
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/)
 */
export type TaskListener<A extends unknown[]> = (
  runnerArgs: TaskRunnerArgs,
  ...args: A
) => void | PromiseLike<void>;

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/#once)
 */
export interface TaskListenerOptions extends TaskOptions {}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/)
 */
export default class TaskEmitter<T extends Record<string | number, unknown[]>> {
  protected readonly _queue = new TaskQueue();
  protected readonly _listeners = new Map() as TypedMap<
    {
      [P in keyof T]: {
        original: TaskListener<T[P]>;
        dispatch: (args: T[P]) => StatefulPromise<unknown>;
      }[];
    }
  >;

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/#on)
   */
  on<K extends keyof T>(
    event: K,
    listener: TaskListener<T[K]>,
  ): void {
    let listeners = this._listeners.get(event);

    if (!listeners?.find(({ original }) => original === listener)) {
      if (!listeners) {
        this._listeners.set(event, listeners = []);
      }

      listeners.push({
        original: listener,
        dispatch: args => this._queue.add(rArgs => listener(rArgs, ...args)),
      });
    }
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/#off)
   */
  off<K extends keyof T>(event: K, listener?: TaskListener<T[K]>): void {
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
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/#once)
   */
  once<K extends keyof T>(
    event: K,
    options: TaskListenerOptions | undefined = {},
  ): StatefulPromise<T[K]> {
    return new StatefulPromise<T[K]>((resolve, reject) => {
      const { signal } = options;

      if (signal?.aborted) {
        reject(signal.reason);
        return;
      }

      const taskListener: TaskListener<T[K]> = (_, ...args) => {
        signal?.removeEventListener("abort", abortHandler);
        this.off(event, taskListener);
        resolve(args);
      };
      const abortHandler = () => {
        this.off(event, taskListener);
        reject(signal!.reason);
      };

      try {
        this.on(event, taskListener);
        signal?.addEventListener("abort", abortHandler, { once: true });
      } catch (e) {
        try {
          this.off(event, taskListener);
        } catch {}

        try {
          signal?.removeEventListener("abort", abortHandler);
        } catch {}

        reject(e);
      }
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/#emit)
   */
  emit<K extends keyof T>(
    event: K,
    ...args: T[K]
  ): undefined | StatefulPromise<unknown>[] {
    const listeners = this._listeners.get(event);

    return listeners
      // コピーしないと .once() 内で this.off() が呼ばれたとき this._listeners が変更される
      // ので、一部のイベントリスナーが呼び出されなかったり、残留しなかったりする。
      && listeners.slice().map(({ dispatch }) => dispatch(args));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/#idle)
   */
  idle(): StatefulPromise<void> {
    return this._queue.idle();
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/task-emitter/#abort)
   */
  abort(reason?: unknown): void {
    this._queue.abort(reason);
  }
}
