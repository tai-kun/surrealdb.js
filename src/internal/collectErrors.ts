/**
 * Collect errors from promises.
 *
 * @param promises - The promises to collect errors from.
 * @returns The errors from the promises.
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
 * Collect errors from promises.
 *
 * @template T - The type of the promises.
 * @param promises - The promises to collect errors from.
 * @param callback - The callback to run on each value.
 * This is used when extracting `Promise` from each element.
 * @returns The errors from the promises.
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

export { collectErrors };
