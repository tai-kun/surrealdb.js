import {
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
} from "./shared";

/**
 * このエラーは、タスクが失敗した場合に投げられます。
 * これは主に、イベントハンドラーがエラーを投げたことを意味します。
 */
export class AggregateTasksError extends SurrealAggregateError {
  static {
    this.prototype.name = "AggregateTasksError";
  }

  /**
   * @param errors 失敗したタスクのリスト。
   */
  constructor(errors: readonly unknown[]) {
    super(`${errors.length} task(s) failed.`, errors);
  }
}

/**
 * このエラーは、リソースがすでに破棄されてる場合に投げられます。
 * これは、非同期タスクを管理するクラスなどがすでにその役目を終えていることを意味します。
 */
export class ResourceAlreadyDisposed extends SurrealError {
  static {
    this.prototype.name = "ResourceAlreadyDisposed";
  }

  /**
   * @param name 破棄されたリソースの名前。
   * @param options エラーオプション。
   */
  constructor(name: string, options?: SurrealErrorOptions | undefined) {
    super(`The resource "${name}" has been disposed.`, options);
  }
}
