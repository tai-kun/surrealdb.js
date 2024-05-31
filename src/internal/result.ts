import type { Simplify } from "type-fest";

type UnknownObject = { readonly [key: keyof any]: unknown };

declare const none: unique symbol;

type None = typeof none;

/**
 * `Ok` indicates that the operation was successful.
 * The property `ok` is always `true`, and additional information is provided as needed.
 *
 * @template T - The type of the value.
 * @template M - The type of the metadata.
 */
export type Ok<T = None, M extends UnknownObject = {}> = T extends None
  ? { ok: true }
  : Simplify<Omit<M, "ok" | "value"> & { ok: true; value: T }>;

/**
 * `Err` indicates that the operation was unsuccessful.
 * The property `ok` is always `false`, and additional information is provided as needed.
 *
 * @template E - The type of the error.
 * @template M - The type of the metadata.
 */
export type Err<E = None, M extends UnknownObject = {}> = E extends None
  ? { ok: false }
  : Simplify<Omit<M, "ok" | "error"> & { ok: false; error: E }>;

/**
 * Create an `Ok` result.
 *
 * @template T - The type of the value.
 * @template M - The type of the metadata.
 * @param value - The value.
 * @param meta - The metadata.
 * @returns The `Ok` result.
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
 * Create an `Err` result.
 *
 * @template E - The type of the error.
 * @template M - The type of the metadata.
 * @param error - The error.
 * @param meta - The metadata.
 * @returns The `Err` result.
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
