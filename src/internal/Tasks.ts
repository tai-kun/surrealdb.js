import type { Promisable } from "type-fest";
import { AggregateTasksError, ResourceDisposed } from "../common/errors";
import { collectErrors } from "./collectErrors";
import { makeAbortApi } from "./makeAbortApi";
import { type Err, err, type Ok, ok } from "./result";
import { runInAsync } from "./runInAsync";
import { StatefulPromise } from "./StatefulPromise";

interface Task<T = unknown> {
  promise?: StatefulPromise<T>;
  abort?:
    | { readonly reason: unknown } // Already aborted
    | { readonly dispatch: (reason?: unknown) => void }; // Not yet aborted
}

/**
 * The arguments for the task runner.
 */
export interface TaskRunnerArgs {
  /**
   * The abort signal for the task.
   */
  readonly signal: AbortSignal;
}

/**
 * The options for a task.
 */
export interface TaskOptions {
  /**
   * The abort signal for the task.
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * A stack of tasks.
 *
 * The created `Tasks` instance must be disposed of by calling `.dispose()` at the end.
 */
export class Tasks {
  #tasks: Task[] = [];
  #aborted = false;
  #disposed = false;

  /**
   * The number of tasks.
   */
  get count(): number {
    return this.#tasks.length;
  }

  /**
   * Add a task to the stack.
   *
   * The added task runner will remove itself from the stack upon completion,
   * regardless of whether it succeeds or fails.
   *
   * Therefore, to ensure we get the result of the task runner,
   * we need to keep the return value of this `.add()` method.
   *
   * The `.dispose()` method only terminates pending task runners,
   * and we won't be able to reliably retrieve the results of the task runner afterward.
   *
   * @template T - The type of the result of the task.
   * @param runner - The task runner.
   * @param options - The options for the task.
   * @returns The result of the task.
   */
  add<T>(
    runner: (args: TaskRunnerArgs) => Promisable<T>,
    options: TaskOptions | undefined = {},
  ): StatefulPromise<T> {
    const task: Task<T> = {};
    this.#tasks.push(task);

    if (this.#disposed) {
      task.promise = StatefulPromise.reject(new ResourceDisposed("Tasks"));
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

          signal.throwIfAborted();
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
   * Whether tasks has been disposed.
   */
  get disposed(): boolean {
    return this.#aborted || this.#disposed;
  }

  /**
   * Dispose tasks, and wait for all tasks to finish.
   *
   * @returns A promise that resolves with the result of tasks.
   */
  async dispose(): Promise<Ok | Err<AggregateTasksError>> {
    if (!this.#disposed) {
      const tasks = this.#tasks.slice();
      this.#tasks = [];
      this.#disposed = true;
      const errors = await collectErrors(tasks, ({ promise }) => promise);
      this.#aborted = true; // disable `.abort()` after disposing

      if (errors.length > 0) {
        return err(new AggregateTasksError(errors));
      }
    }

    return ok();
  }

  /**
   * Cancel all tasks.
   *
   * Since the event listeners run asynchronously,
   * we use `.dispose()` to wait for their termination.
   *
   * @param reason - The reason for aborting tasks.
   */
  abort(reason?: unknown): void {
    // Dispatch the abort signal regardless of whether it has been discarded.
    // However, if it has already been aborted, it will not do the same thing.
    if (!this.#aborted) {
      this.#aborted = true;

      for (const task of this.#tasks) {
        if (task.abort) {
          if ("reason" in task.abort) {
            // It is considered to be already aborted.
          } else {
            task.abort.dispatch(reason);
          }
        } else {
          task.abort = { reason };
        }
      }
    }
  }
}
