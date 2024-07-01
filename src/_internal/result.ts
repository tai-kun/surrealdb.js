import type { Simplify } from "type-fest";

type UnknownObject = { readonly [key: keyof any]: unknown };

declare const none: unique symbol;

type None = typeof none;

/**
 * これは操作が成功したことを示します。
 * プロパティ `ok` は常に `true` で、必要に応じて追加情報が提供されます。
 *
 * @template T 値の型。
 * @template M メタデータの型。
 */
export type Ok<T = None, M extends UnknownObject = {}> = T extends None
  ? { ok: true }
  : Simplify<Omit<M, "ok" | "value"> & { ok: true; value: T }>;

/**
 * これは操作が失敗したことを示します。
 * プロパティ `ok` は常に `false` で、必要に応じて追加情報が提供されます。
 *
 * @template E エラーの型。
 * @template M メタデータの型。
 */
export type Err<E = None, M extends UnknownObject = {}> = E extends None
  ? { ok: false }
  : Simplify<Omit<M, "ok" | "error"> & { ok: false; error: E }>;

/**
 * `Ok` 型のオブジェクトを作成します。
 *
 * @template T 値の型。
 * @template M メタデータの型。
 * @param value 値。
 * @param meta メタデータ。
 * @returns `Ok` 型のオブジェクト。
 * @example
 * ```ts
 * const result = ok();
 * console.log(result); // { ok: true }
 * ```
 * @example
 * ```ts
 * const result = ok(1);
 * console.log(result); // { ok: true, value: 1 }
 * ```
 * @example
 * ```ts
 * const result = ok(1, { meta: true });
 * console.log(result); // { ok: true, value: 1, meta: true }
 * ```
 */
export const ok: {
  (): Ok;
  <T, M extends UnknownObject = {}>(value: T, meta?: M): Ok<T, M>;
} = (...args: [unknown?, any?]) =>
  args.length === 0
    ? { ok: true }
    : { ...args[1], ok: true, value: args[0] };

/**
 * `Err` 型のオブジェクトを作成します。
 *
 * @template E エラーの型。
 * @template M メタデータの型。
 * @param error エラー。
 * @param meta メタデータ。
 * @returns `Err` 型のオブジェクト。
 * @example
 * ```ts
 * const result = err();
 * console.log(result); // { ok: false }
 * ```
 * @example
 * ```ts
 * const result = err("reason");
 * console.log(result); // { ok: false, error: "reason" }
 * ```
 * @example
 * ```ts
 * const result = err("reason", { meta: true });
 * console.log(result); // { ok: false, error: "reason", meta: true }
 * ```
 */
export const err: {
  (): Err;
  <E, M extends UnknownObject = {}>(error: E, meta?: M): Err<E, M>;
} = (...args: [unknown?, any?]) =>
  args.length === 0
    ? { ok: false }
    : { ...args[1], ok: false, error: args[0] };
