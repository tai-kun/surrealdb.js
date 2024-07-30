/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/is-safe-number/)
 */
export default function isSafeNumber(value: number): boolean {
  return !(
    typeof value !== "number"
    || value !== value
    || value === Infinity
    || value === -Infinity
    || value > 9007199254740991 // Number.MAX_SAFE_INTEGER
    || value < -9007199254740991 // Number.MIN_SAFE_INTEGER
  );
}
