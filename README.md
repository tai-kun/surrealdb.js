## テストサイズ

* スモール
    * 純粋にその関数やクラスで完結するテスト
* ミディアム
    * テスト毎に SurrealDB を起動して、実際にデータベースを操作するテスト

## ステータス

* [![Node.js](https://github.com/tai-kun/surrealdb-js/actions/workflows/nodejs.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/nodejs.yml)
    * v18.x のミディアムテストのみ必ずタイムアウトするため、そこだけテストがスキップされています。
* [![Deno](https://github.com/tai-kun/surrealdb-js/actions/workflows/deno.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/deno.yml)
    * `abortSignal.timeout` がリソースリークするバグが修正されるまで、一部のスモールテストと全ミディアムテストがスキップされています。
* [![Bun](https://github.com/tai-kun/surrealdb-js/actions/workflows/bun.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/bun.yml)
* [![Chrome](https://github.com/tai-kun/surrealdb-js/actions/workflows/chrome.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/chrome.yml)
* [![Firefox](https://github.com/tai-kun/surrealdb-js/actions/workflows/firefox.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/firefox.yml)
    * Selenium からスタックトレースをうまく取れないので、一部のエラー関連のテストがスキップされています。
