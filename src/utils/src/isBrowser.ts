// Deno では window がグローバルに追加されてしまうため、document の有無でブラウザかどうかを判定する。
export default typeof document !== "undefined";
