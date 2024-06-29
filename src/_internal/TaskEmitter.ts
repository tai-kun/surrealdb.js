import type { Promisable } from "type-fest";
import {
  type AggregateTasksError,
  ResourceAlreadyDisposed,
} from "~/common/errors";
import type { Err, Ok } from "./result";
import StatefulPromise from "./StatefulPromise";
import TaskQueue, { type TaskOptions, type TaskRunnerArgs } from "./TaskQueue";
import throwIfAborted from "./throwIfAborted";

interface TypedMap<T> {
  clear(): void;
  delete(key: keyof T): boolean;
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K]): this;
  keys(): IterableIterator<keyof T>;
}

/**
 * タスクのイベントリスナー。
 *
 * @template A - イベントリスナーの引数の型。
 */
export interface TaskListener<A extends unknown[]> {
  /**
   * タスクを実行します。
   *
   * @param runnerArgs - タスクランナーに渡される引数。
   * @param args - イベントリスナーの引数。
   */
  (runnerArgs: TaskRunnerArgs, ...args: A): Promisable<void>;
}

/**
 * タスクのイベントリスナーのオプション。
 */
export interface TaskListenerOptions extends TaskOptions {}

/**
 * `TaskQueue` によって管理される非同期タスクのイベントエミッター。
 * 作成された `TaskEmitter` インスタンスは、最後に `.dispose()` を呼び出すことで破棄される必要があります。
 *
 * @template T - イベントの型。
 */
export default class TaskEmitter<T extends Record<string | number, unknown[]>> {
  #tasks = new TaskQueue();
  #listeners = new Map() as TypedMap<
    {
      [K in keyof T]: {
        task: TaskListener<T[K]>;
        emit: (args: T[K]) => StatefulPromise<unknown>;
      }[];
    }
  >;

  /**
   * イベントリスナーを追加します。
   *
   * @template K - イベントの型。
   * @param event - リスナーを追加するイベント。
   * @param listener - 追加するリスナー。
   * @example
   * ```typescript
   * const taskEmitter = new TaskEmitter();
   * taskEmitter.on("event", async ({ signal }, arg0) => {
   *   awiat doSomething(arg0, { signal });
   * });
   * taskEmitter.emit("event", 1);
   * await taskEmitter.dispose();
   * ```
   */
  on<K extends keyof T>(
    event: K,
    listener: TaskListener<T[K]>,
  ): void {
    if (this.disposed) {
      throw new ResourceAlreadyDisposed("TaskEmitter");
    }

    let listeners = this.#listeners.get(event);

    if (!listeners?.find(({ task }) => task === listener)) {
      if (!listeners) {
        this.#listeners.set(event, listeners = []);
      }

      listeners.push({
        task: listener,
        emit: args =>
          this.#tasks.add(runnerArgs => listener(runnerArgs, ...args)),
      });
    }
  }

  /**
   * イベントリスナーを削除します。
   *
   * @template K - イベントの型。
   * @param event - リスナーを削除するイベント。
   * @param listener - 削除するリスナー。
   * @example
   * ```typescript
   * const taskEmitter = new TaskEmitter();
   * const listener = async ({ signal }, arg0) => {
   *   awiat doSomething(arg0, { signal });
   * };
   * taskEmitter.on("event", listener);
   *
   * taskEmitter.off("event", listener);
   * // または
   * taskEmitter.off("event");
   *
   * await taskEmitter.dispose();
   * ```
   */
  off<K extends keyof T>(event: K, listener?: TaskListener<T[K]>): void {
    const listeners = this.#listeners.get(event);

    if (listeners) {
      if (listener) {
        const index = listeners.findIndex(({ task }) => task === listener);

        if (index !== -1) {
          listeners.splice(index, 1);

          if (listeners.length === 0) {
            this.#listeners.delete(event);
          }
        }
      } else {
        this.#listeners.delete(event);
      }
    }
  }

  /**
   * イベントを待機します。
   *
   * @template K - イベントの型。
   * @param event - 待機するイベント。
   * @param options - タスクリスナーのオプション。
   * @returns イベントリスナーに渡された引数。
   * @example
   * ```ts
   * const args = await taskEmitter.once("event");
   * ```
   * @example
   * ```ts
   * const signal = AbortSignal.timeout(5_000);
   * const args = await taskEmitter.once("event", { signal });
   * ```
   */
  once<K extends keyof T>(
    event: K,
    options: TaskListenerOptions | undefined = {},
  ): StatefulPromise<T[K]> {
    const { promise, resolve, reject } = StatefulPromise.withResolvers<T[K]>();

    try {
      // this.on を使うバージョンのメモ。
      // const { signal } = options;
      // throwIfAborted(signal);
      // const taskListener: TaskListener<T[K]> = (_, ...args) => {
      //   signal?.removeEventListener("abort", abortHandler);
      //   this.off(event, taskListener);
      //   resolve(args);
      // };
      // const abortHandler = () => {
      //   this.off(event, taskListener);
      //   reject(signal!.reason);
      // };
      // this.on(event, taskListener);
      // signal?.addEventListener("abort", abortHandler, { once: true });

      if (this.disposed) {
        throw new ResourceAlreadyDisposed("TaskEmitter");
      }

      let listeners = this.#listeners.get(event);

      if (!listeners) {
        this.#listeners.set(event, listeners = []);
      }

      const { signal } = options;
      const taskId = () => {};
      const handleAbort = (): void => {
        this.off(event, taskId);
        reject(signal!.reason);
      };
      throwIfAborted(signal);
      signal?.addEventListener("abort", handleAbort, { once: true });
      listeners.push({
        task: taskId,
        emit: args => {
          this.off(event, taskId);
          signal?.removeEventListener("abort", handleAbort);
          resolve(args);

          return promise;
        },
      });
    } catch (error) {
      reject(error);
    }

    return promise;
  }

  /**
   * イベントを発生させます。
   * この emit によってトリガされたイベントリスナーを待つために `Promise.all` を使用できます。
   * `.dispose()` で正しく破棄されるなら、これらの Promise を待つ必要はなく、リソースリークも発生しません。
   *
   * @template K - イベントの型。
   * @param event - 発生させるイベント。
   * @param args - イベントリスナーに渡される引数。
   * @returns このイベントによってトリガーされたイベントリスナーの Promise のリスト。
   * @example
   * ```typescript
   * taskEmitter.emit("event", 1);
   * ```
   * @example
   * ```typescript
   * const promises = taskEmitter.emit("event", 1);
   * const results = await Promise.all(promises || []);
   * ```
   */
  emit<K extends keyof T>(
    event: K,
    ...args: T[K]
  ): undefined | StatefulPromise<unknown>[] {
    const listeners = this.#listeners.get(event);

    return listeners
      // コピーしないと .once() 内で this.off() が呼ばれたとき this.#listeners が変更される
      // ので、一部のイベントリスナーが呼び出されなかったり、残留しなかったりする。
      && [...listeners].map(({ emit }) => emit(args));
  }

  /**
   * このインスタンスが破棄されているかどうか。
   * 破棄されている場合は `true`、そうでない場合は `false` です。
   */
  get disposed(): boolean {
    return this.#tasks.disposed;
  }

  /**
   * このインスタンスを破棄し、すべてのタスクが終了するまで待機します。
   *
   * @returns タスクがすべて成功した場合は `Ok`、そうでない場合は `Err` を返します。
   * @example
   * ```typescript
   * const taskEmitter = new TaskEmitter();
   * taskEmitter.on("event", async ({ signal }, ...args) => {
   *   // 時間のかかる処理
   * });
   * taskEmitter.on("event", async ({ signal }, ...args) => {
   *   // 時間のかかる処理
   * });
   * const result = await taskEmitter.dispose();
   *
   * if (result.ok) {
   *   console.log("全てのタスクが正常に終了しました。");
   * } else {
   *   throw result.error; // AggregateTasksError を投げる。
   * }
   */
  async dispose(): Promise<Ok | Err<AggregateTasksError>> {
    return await this.#tasks.dispose();
  }

  /**
   * すべてのタスクを中止します。
   *
   * @param reason - 中止の理由。
   * @example
   * ```typescript
   * taskEmitter.abort();
   * ```
   */
  abort(reason?: unknown): void {
    this.#tasks.abort(reason);
  }
}
