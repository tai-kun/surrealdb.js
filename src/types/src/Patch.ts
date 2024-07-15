// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/operation.rs

/**
 * 値を追加するパッチ操作。
 *
 * @template T 追加する値の型。
 * @template P パスの型。
 */
export interface AddPatch<T = unknown, P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "add";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 追加する/された値。
   */
  value: T;
}

/**
 * 値を削除するパッチ操作。
 *
 * @template P パスの型。
 */
export interface RemovePatch<P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "remove";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
}

/**
 * 値を置換するパッチ操作。
 *
 * @template T 置換する値の型。
 * @template P パスの型。
 */
export interface ReplacePatch<T = unknown, P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "replace";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 置換する/された値。
   */
  value: T;
}

/**
 * 値を変更するパッチ操作。
 *
 * @template T 変更する値の型。
 * @template P パスの型。
 */
export interface ChangePatch<
  T extends string = string,
  P extends string = string,
> {
  /**
   * パッチの操作名。
   */
  op: "change";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 変更する/された値。
   */
  value: T;
}

/**
 * 値をコピーするパッチ操作。
 *
 * @template F コピー元のパスの型。
 * @template P コピー先のパスの型。
 */
export interface CopyPatch<
  F extends string = string,
  P extends string = string,
> {
  /**
   * パッチの操作名。
   */
  op: "copy";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * コピー元のパス。
   */
  from: F;
}

/**
 * 値を移動するパッチ操作。
 *
 * @template F 移動元のパスの型。
 * @template P 移動先のパスの型。
 */
export interface MovePatch<
  F extends string = string,
  P extends string = string,
> {
  /**
   * パッチの操作名。
   */
  op: "move";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * 移動元のパス。
   */
  from: F;
}

/**
 * 値が設定されているかテストするパッチ操作。
 *
 * @template T テストする値の型。
 * @template P パスの型。
 */
export interface TestPatch<T = unknown, P extends string = string> {
  /**
   * パッチの操作名。
   */
  op: "test";
  /**
   * 変更を加える値への JSON パス。
   */
  path: P;
  /**
   * テストする値。
   */
  value: T;
}

/**
 * パッチ操作。
 *
 * @template T 値の型。
 */
export type Patch<T = unknown> =
  | AddPatch<T>
  | RemovePatch
  | ReplacePatch<T>
  | ChangePatch
  | MovePatch
  | CopyPatch
  | TestPatch<T>;

/**
 * 読み取り専用のパッチ操作。
 *
 * @template T 値の型。
 */
export type ReadonlyPatch<T = unknown> =
  | Readonly<AddPatch<T>>
  | Readonly<RemovePatch>
  | Readonly<ReplacePatch<T>>
  | Readonly<ChangePatch>
  | Readonly<MovePatch>
  | Readonly<CopyPatch>
  | Readonly<TestPatch<T>>;
