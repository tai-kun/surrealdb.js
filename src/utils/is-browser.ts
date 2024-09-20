// Deno では window がグローバルに追加されてしまうため、document の有無でブラウザかどうかを判定する。
/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/utils/is-browser/)
 */
export default function isBrowser(): boolean {
  return typeof document !== "undefined";
}
