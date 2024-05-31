import type { Promisable } from "type-fest";
import { type AggregateTasksError, ResourceDisposed } from "../common/errors";
import type { Err, Ok } from "./result";
import { StatefulPromise } from "./StatefulPromise";
import { type TaskOptions, type TaskRunnerArgs, Tasks } from "./Tasks";

interface TypedMap<T> {
  clear(): void;
  delete(key: keyof T): boolean;
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K]): this;
  keys(): IterableIterator<keyof T>;
}

/**
 * The listener for a task.
 *
 * @template A - The type of the arguments for the listener.
 * @param runnerArgs - The arguments for the task runner.
 * @param args - The arguments for the listener.
 */
export type TaskListener<A extends unknown[]> = (
  runnerArgs: TaskRunnerArgs,
  ...args: A
) => Promisable<void>;

/**
 * The options for a task event listener.
 */
export interface TaskListenerOptions extends TaskOptions {}

/**
 * An event emitter for tasks.
 *
 * The created `TaskEmitter` instance must be disposed of by calling `.dispose()` at the end.
 */
export class TaskEmitter<T extends Record<string | number, unknown[]>> {
  #tasks = new Tasks();
  #listeners = new Map() as TypedMap<
    {
      [K in keyof T]: {
        task: TaskListener<T[K]>;
        emit: (args: T[K]) => StatefulPromise<unknown>;
      }[];
    }
  >;

  /**
   * @template T - The type of the events.
   */
  constructor() {}

  /**
   * Add a listener for an event.
   *
   * @template K - The type of the event.
   * @param event - The event to listen for.
   * @param listener - The listener for the event.
   */
  on<K extends keyof T>(
    event: K,
    listener: TaskListener<T[K]>,
  ): void {
    if (this.disposed) {
      throw new ResourceDisposed("TaskEmitter");
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
   * Remove a listener for an event.
   *
   * @template K - The type of the event.
   * @param event - The event to stop listening for.
   * @param listener - The listener to remove.
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
   * Wait for an event to be emitted.
   *
   * @template K - The type of the event.
   * @param event - The event to wait for.
   * @param options - The options for the listener.
   * @returns A promise that resolves with the arguments for the event.
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
      if (this.disposed) {
        throw new ResourceDisposed("TaskEmitter");
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
      signal?.throwIfAborted();
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
   * Emit an event.
   *
   * We can use `Promise.all` to wait for the event listeners triggered by this emit to complete.
   *
   * If the emitter is properly disposed of using `.dispose()`,
   * there is no need to wait for these Promises, and there will be no resource leaks.
   *
   * @template K - The type of the event.
   * @param event - The event to emit.
   * @param args - The arguments for the event.
   * @returns The promises for the listeners, if any.
   * @example
   * ```ts
   * taskEmitter.emit("event", 1);
   * ```
   * @example
   * ```ts
   * const promises = taskEmitter.emit("event", 1);
   * const results = await Promise.all(promises || []);
   * ```
   */
  emit<K extends keyof T>(
    event: K,
    ...args: T[K]
  ): undefined | StatefulPromise<unknown>[] {
    return this.#listeners.get(event)?.map(({ emit }) => emit(args));
  }

  /**
   * Whether the task emitter has been disposed.
   */
  get disposed(): boolean {
    return this.#tasks.disposed;
  }

  /**
   * Dispose the task emitter, and wait for all tasks to finish.
   *
   * @returns A promise that resolves with the result of tasks.
   */
  async dispose(): Promise<Ok | Err<AggregateTasksError>> {
    return await this.#tasks.dispose();
  }

  /**
   * Request all event listeners to stop processing.
   *
   * Since the event listeners run asynchronously,
   * we use `.dispose()` to wait for their termination.
   *
   * @param reason - The reason for aborting the task emitter.
   */
  abort(reason?: unknown): void {
    this.#tasks.abort(reason);
  }
}
