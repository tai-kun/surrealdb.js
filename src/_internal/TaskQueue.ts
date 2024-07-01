import type { Promisable } from "type-fest";
import { AggregateTasksError, ResourceAlreadyDisposed } from "~/errors";
import collectErrors from "./collectErrors";
import makeAbortApi from "./makeAbortApi";
import { type Err, err, type Ok, ok } from "./result";
import runInAsync from "./runInAsync";
import StatefulPromise from "./StatefulPromise";
import throwIfAborted from "./throwIfAborted";

interface Task<T = unknown> {
  promise?: StatefulPromise<T>;
  abort?:
    | { readonly reason: unknown } // すでに中止されている
    | { readonly dispatch: (reason?: unknown) => void }; // まだ中止されていない
}

/**
 * タスクランナーに渡される引数。
 */
export interface TaskRunnerArgs {
  /**
   * タスクを中止するためのシグナル。
   */
  readonly signal: AbortSignal;
}

/**
 * タスクランナーの実行オプション。
 */
export interface TaskOptions {
  /**
   * タスクを中止するためのシグナル。
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * 非同期タスクを管理するクラス。
 * 作成された `TaskQueue` インスタンスは、最後に `.dispose()` を呼び出すことで破棄される必要があります。
 * 同時実行性を盛業する方法はありません。すべてのタスクランナーは非同期的に実行されます。
 */
export default class TaskQueue {
  #tasks: Task[] = [];
  #disposed = false;

  /**
   * キューに追加されているタスクの数。
   */
  get count(): number {
    return this.#tasks.length;
  }

  /**
   * タスクランナーをキューに追加します。
   * 追加されたタスクランナーは、成功または失敗に関わらず、自身をキューから削除します。
   * したがって、タスクランナーの結果を確実に取得するためには、この `.add()` メソッドの戻り値を保持する必要があります。
   * `.dispose()` メソッドは保留中のタスクランナーを終了するだけであり、その後タスクランナーの結果を確実に取得する方法は無くなります。
   *
   * @template T タスクランナーの結果の型。
   * @param runner タスクランナー。
   * @param options タスクランナーの実行オプション。
   * @returns タスクランナーの結果を取得するための `StatefulPromise` インスタンス。
   * @example
   * ```ts
   * const queue = new TaskQueue();
   * const task = queue.add(async ({ signal }) => {
   *   const response = await fetch("https://localhost:8000/data", { signal });
   *   return await response.json();
   * });
   * const data = await task;
   * await queue.dispose();
   * ```
   */
  add<T>(
    runner: (args: TaskRunnerArgs) => Promisable<T>,
    options: TaskOptions | undefined = {},
  ): StatefulPromise<T> {
    const task: Task<T> = {};
    this.#tasks.push(task);

    if (this.#disposed) {
      task.promise = StatefulPromise.reject(
        new ResourceAlreadyDisposed("TaskQueue"),
      );
    } else {
      const cleanup = () => {
        const index = this.#tasks.indexOf(task);

        if (index !== -1) {
          this.#tasks.splice(index, 1);
        }
      };
      task.promise = new StatefulPromise<T>((resolve, reject) => {
        function handleFulfilled(value: T): void {
          cleanup();
          resolve(value);
        }

        function handleRejected(reason: unknown): void {
          cleanup();
          reject(reason);
        }

        try {
          const [signal, abort] = makeAbortApi(options.signal);

          if (task.abort) {
            if ("reason" in task.abort) {
              abort(task.abort.reason);
            } else {
              throw new Error("unreachable");
            }
          } else {
            task.abort = { dispatch: abort };
          }

          throwIfAborted(signal);
          runInAsync(runner, { signal }).then(
            handleFulfilled,
            handleRejected,
          );
        } catch (error) {
          handleRejected(error);
        }
      });
    }

    return task.promise;
  }

  /**
   * このインスタンスが破棄されているかどうか。
   * 破棄されている場合は `true`、そうでない場合は `false` です。
   */
  get disposed(): boolean {
    return this.#disposed;
  }

  /**
   * このインスタンスを破棄し、すべてのタスクが終了するまで待機します。
   *
   * @returns タスクがすべて成功した場合は `Ok`、そうでない場合は `Err` を返します。
   * @example
   * ```ts
   * const queue = new TaskQueue();
   * queue.add(async ({ signal }) => {
   *   // 時間のかかる処理
   * });
   * queue.add(async ({ signal }) => {
   *   // 時間のかかる処理
   * });
   * const result = await queue.dispose();
   *
   * if (result.ok) {
   *   console.log("全てのタスクが正常に終了しました。");
   * } else {
   *   throw result.error; // AggregateTasksError を投げる。
   * }
   * ```
   */
  async dispose(): Promise<Ok | Err<AggregateTasksError>> {
    if (!this.#disposed) {
      const tasks = this.#tasks.slice();
      this.#tasks = [];
      this.#disposed = true;
      const errors = await collectErrors(tasks, ({ promise }) => promise);

      if (errors.length > 0) {
        return err(new AggregateTasksError(errors));
      }
    }

    return ok();
  }

  /**
   * すべてのタスクを中止します。
   *
   * @param reason 中止の理由。
   * @example
   * ```ts
   * const queue = new TaskQueue();
   * const task = queue.add(({ signal }) => {
   *   return new Promise((_, reject) => {
   *     signal.addEventListener("abort", () => {
   *       reject(signal.reason);
   *     });
   *   });
   * });
   * const timeout = setTimeout(() => {
   *   queue.abort(new Error("タイムアウト"));
   * }, 1_000);
   *
   * try {
   *   await task;
   * } catch (error) {
   *   console.error(error); // 「タイムアウト」エラーが表示される。
   * } finally {
   *   clearTimeout(timeout);
   *   await queue.dispose();
   * }
   * ```
   */
  abort(reason?: unknown): void {
    for (const task of this.#tasks) {
      if (task.abort) {
        if ("reason" in task.abort) {
          // すでに中止されていると見なされます。
        } else {
          task.abort.dispatch(reason);
        }
      } else {
        task.abort = { reason };
      }
    }
  }
}
