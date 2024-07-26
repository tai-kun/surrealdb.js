import makeAbortApi from "./make-abort-api";
import StatefulPromise from "./stateful-promise";

interface Task<T = unknown> {
  readonly promise: StatefulPromise<T>;
  readonly abort: (reason?: unknown) => void;
}

export interface TaskRunnerArgs {
  signal: AbortSignal;
}

export interface TaskOptions {
  readonly signal?: AbortSignal | undefined;
}

export default class TaskQueue {
  protected _queue: Task[] = [];
  protected _empty: (() => void)[] = [];

  get count(): number {
    return this._queue.length;
  }

  protected rm(task: Task): void {
    const i = this._queue.indexOf(task);

    if (i >= 0) {
      this._queue.splice(i, 1);

      if (this._queue.length <= 0) {
        while (this._empty.length > 0) {
          this._empty.shift()!();
        }
      }
    }
  }

  add<T>(
    runner: (args: TaskRunnerArgs) => T | PromiseLike<T>,
    options: TaskOptions | undefined = {},
  ): StatefulPromise<T> {
    let signal: AbortSignal, abort: (reason?: unknown) => void;

    try {
      [signal, abort] = makeAbortApi(options.signal);
    } catch (e) {
      return StatefulPromise.reject(e);
    }

    const task = {} as { -readonly [P in keyof Task<T>]: Task<T>[P] };
    task.abort = abort;
    task.promise = StatefulPromise.try(runner, { signal }).then(
      (x): T => {
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

  empty(): StatefulPromise<void> {
    if (this._queue.length <= 0) {
      return StatefulPromise.resolve();
    }

    return new StatefulPromise(resolve => {
      this._empty.push(resolve);
    });
  }

  abort(reason?: unknown): void {
    for (const t of this._queue) {
      t.abort(reason);
    }
  }
}
