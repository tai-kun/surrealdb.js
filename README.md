## テストサイズ

* スモール
    * 純粋にその関数やクラスで完結するテスト
* ミディアム
    * テスト毎に SurrealDB を起動して、実際にデータベースを操作するテスト

## ステータス

* [![Node.js](https://github.com/tai-kun/surrealdb-js/actions/workflows/nodejs.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/nodejs.yml)
    * v18.x のミディアムテストのみ必ずタイムアウトするため、そこのテストがスキップされています。v20.x と v22.x は何もスキップされていません。
* [![Deno](https://github.com/tai-kun/surrealdb-js/actions/workflows/deno.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/deno.yml)
    * `abortSignal.timeout` がリソースリークするバグが修正されるまで、一部のスモールテストと全ミディアムテストがスキップされています。Issue: [#20663](https://github.com/denoland/deno/issues/20663)
* [![Bun](https://github.com/tai-kun/surrealdb-js/actions/workflows/bun.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/bun.yml)
    * テストは何もスキップされていません。
* [![Chrome](https://github.com/tai-kun/surrealdb-js/actions/workflows/chrome.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/chrome.yml)
    * テストは何もスキップされていません。
* [![Firefox](https://github.com/tai-kun/surrealdb-js/actions/workflows/firefox.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/firefox.yml)
    * Selenium からスタックトレースをうまく取れないので、一部のエラー関連のテストがスキップされています。
