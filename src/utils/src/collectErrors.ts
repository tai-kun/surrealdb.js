/**
 * Promise のエラーを収集します。
 *
 * @param promises エラーを収集する Promise のリスト。
 * @returns Promise のエラーのリスト。
 * @example
 * ```ts
 * const errors = await collectErrors([
 *   Promise.resolve(1),
 *   Promise.reject(new Error("error")),
 *   undefined,
 * ]);
 * console.log(errors); // [new Error("error")]
 * ```
 */
function collectErrors(
  promises: Iterable<PromiseLike<unknown> | undefined>,
): Promise<unknown[]>;

/**
 * Promise のエラーを収集します。
 *
 * @template T Promise の型。
 * @param promises エラーを収集する Promise のリスト。
 * @param callback 各要素から Promise を抽出するために使用されるコールバック。
 * @returns Promise のエラーのリスト。
 * @example
 * ```ts
 * const promises: { promise: Promise<any> }[] = [...];
 * const errors = await collectErrors(
 *   promises,
 *   ({ promise }) => promise,
 * );
 * console.log(errors); // [...]
 * ```
 */
function collectErrors<T>(
  promises: Iterable<T>,
  callback: (value: T) => PromiseLike<unknown> | undefined,
): Promise<unknown[]>;

async function collectErrors(
  promises: Iterable<any>,
  callback: (value: any) => PromiseLike<unknown> | undefined = value => value,
): Promise<unknown[]> {
  const errors: unknown[] = [];
  await Promise.all(Array.from(promises, async value => {
    try {
      await callback(value);
    } catch (error) {
      errors.push(error);
    }
  }));

  return errors;
}

export default collectErrors;
