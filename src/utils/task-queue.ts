import makeAbortApi from "./make-abort-api";
import StatefulPromise from "./stateful-promise";

interface Task<TValue = unknown> {
  readonly promise: StatefulPromise<TValue>;
  readonly abort: (reason?: unknown) => void;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-queue/#add)
 */
export interface TaskRunnerArgs {
  signal: AbortSignal;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-queue/#add)
 */
export interface TaskOptions {
  readonly signal?: AbortSignal | undefined;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-queue/)
 */
export default class TaskQueue {
  protected readonly _queue: Task[] = [];
  protected readonly _idle: (() => void)[] = [];

  protected rm(task: Task): void {
    const i = this._queue.indexOf(task);

    if (i >= 0) {
      this._queue.splice(i, 1);

      if (this._queue.length <= 0) {
        while (this._idle.length > 0) {
          this._idle.shift()!();
        }
      }
    }
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-queue/#count)
   */
  get count(): number {
    return this._queue.length;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-queue/#add)
   */
  add<TValue>(
    runner: (args: TaskRunnerArgs) => TValue | PromiseLike<TValue>,
    options: TaskOptions | undefined = {},
  ): StatefulPromise<TValue> {
    let signal: AbortSignal, abort: (reason?: unknown) => void;

    try {
      [signal, abort] = makeAbortApi(options.signal);
    } catch (e) {
      return StatefulPromise.reject(e);
    }

    const task = {} as { -readonly [P in keyof Task<TValue>]: Task<TValue>[P] };
    task.abort = abort;
    task.promise = StatefulPromise.try(runner, { signal }).then(
      (x): TValue => {
        this.rm(task);
        return x;
      },
      (e): never => {
        this.rm(task);
        throw e;
      },
    );
    this._queue.push(task);

    return task.promise;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-queue/#idle)
   */
  idle(): StatefulPromise<void> {
    if (this._queue.length <= 0) {
      return StatefulPromise.resolve();
    }

    return new StatefulPromise(resolve => {
      this._idle.push(resolve);
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/task-queue/#abort)
   */
  abort(reason?: unknown): void {
    for (const t of this._queue) {
      t.abort(reason);
    }
  }
}
