# Changelog

## [2.2.0](https://github.com/tai-kun/surrealdb.js/compare/v2.1.2...v2.2.0) (2024-11-27)


### Changes

* **data-types/encodable:** `Future` が自動で中括弧 `{}` を付けない ([#59](https://github.com/tai-kun/surrealdb.js/issues/59)) ([81236f3](https://github.com/tai-kun/surrealdb.js/commit/81236f38fc2c741e34972437521df27c741f6d2b))


### Features

* &gt;=2.1.0 ([663a6a3](https://github.com/tai-kun/surrealdb.js/commit/663a6a37a654c94ccc37bff97324ad23d19aa7c6))


### Miscellaneous Chores

* **deps:** 更新 ([#61](https://github.com/tai-kun/surrealdb.js/issues/61)) ([75c46e3](https://github.com/tai-kun/surrealdb.js/commit/75c46e33ae08703728f3cc51364a362aef4c6893))

## [2.1.2](https://github.com/tai-kun/surrealdb.js/compare/v2.1.1...v2.1.2) (2024-10-24)


### Changes

* **surreal:** Pool のセットアップで相リアスを取得できるようにする ([4f54ce9](https://github.com/tai-kun/surrealdb.js/commit/4f54ce93415823262d372864bda9292544e52048))


### Miscellaneous Chores

* **deps-dev:** 更新 ([ed37220](https://github.com/tai-kun/surrealdb.js/commit/ed372206bc6fd162fb85fa263cde65d317a1a58c))
* **deps-dev:** 更新 ([6e0f01a](https://github.com/tai-kun/surrealdb.js/commit/6e0f01aa4aea9f48c0d1382c2c5ae416ad49261b))

## [2.1.1](https://github.com/tai-kun/surrealdb.js/compare/v2.1.0...v2.1.1) (2024-10-19)


### Changes

* flat exports に全面移行 ([0f7d114](https://github.com/tai-kun/surrealdb.js/commit/0f7d1145d9b4b343cf045ab976011a8a5b4c7d39))

## [2.1.0](https://github.com/tai-kun/surrealdb.js/compare/v2.0.3...v2.1.0) (2024-10-17)


### Features

* **surreal:** コネクションプールを追加 ([a523c38](https://github.com/tai-kun/surrealdb.js/commit/a523c38b1ca97390a4b7b5088977b0d4db5200ee))


### Bug Fixes

* **errors:** メッセージを修正 ([566b7d9](https://github.com/tai-kun/surrealdb.js/commit/566b7d9c6be7a78864916dbbd17a62c4d6f53541))

## [2.0.3](https://github.com/tai-kun/surrealdb.js/compare/v2.0.2...v2.0.3) (2024-10-11)


### Bug Fixes

* **errors:** エラーメッセージの修正 ([#49](https://github.com/tai-kun/surrealdb.js/issues/49)) ([5162825](https://github.com/tai-kun/surrealdb.js/commit/5162825fe6cc5dc98b99489ff49133a0144b5978))


### Miscellaneous Chores

* **package.json:** exports フィールドをフラットにする ([#50](https://github.com/tai-kun/surrealdb.js/issues/50)) ([4a763b5](https://github.com/tai-kun/surrealdb.js/commit/4a763b5b5e4899dff6b7bcb19d954ebf8852c473))

## [2.0.2](https://github.com/tai-kun/surrealdb.js/compare/v2.0.1...v2.0.2) (2024-10-04)


### Bug Fixes

* **utils:** escapeKey を surrealdb の実装と同期する ([#46](https://github.com/tai-kun/surrealdb.js/issues/46)) ([846cb09](https://github.com/tai-kun/surrealdb.js/commit/846cb0952d74e0d3e276db4281f2372ec626c1ef))

## [2.0.1](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0...v2.0.1) (2024-10-01)


### Miscellaneous Chores

* **.config:** リリース項目を追加 ([d19573c](https://github.com/tai-kun/surrealdb.js/commit/d19573cf3c0a0ea926ef402a0415e4da05addea2))
* **deps:** パッケージを更新 ([ce57c09](https://github.com/tai-kun/surrealdb.js/commit/ce57c0981f7b7234d9f1a129ff5180663018443e))

## [2.0.0](https://github.com/tai-kun/surrealdb.js/compare/v1.4.3...v2.0.0) (2024-09-28)


### ⚠ BREAKING CHANGES

* **data-types:** `tb` を `table` に改名
* **data-types/standard:** Duration の `set` を `sub` に修正
* **formatter:** Sec-Websocket-Protocol ヘッダーを必ず指定する
* **clients/standard:** Jwt の `.getTimeUntilExpiration` を `.getSecondsUntilExpiration` に変更
* **surreal/surql:** メソッド名に統一感出す
* disconnect を close に改名
* v2

### Changes

* **clients/standard:** Jwt の `.getTimeUntilExpiration` を `.getSecondsUntilExpiration` に変更 ([c4bd5da](https://github.com/tai-kun/surrealdb.js/commit/c4bd5da9308ee4f7825687b535b47153ee3a5b9d))
* **data-types:** `tb` を `table` に改名 ([72809e0](https://github.com/tai-kun/surrealdb.js/commit/72809e01170d54c4d8a6a009876f5e67f7e30e6d))
* disconnect を close に改名 ([a4588a9](https://github.com/tai-kun/surrealdb.js/commit/a4588a96eb84773321f93aebe5e0e82b0827860f))
* **engines/websocket:** 名前空間とデータベースの矛盾を検知しない ([9bdbc58](https://github.com/tai-kun/surrealdb.js/commit/9bdbc5826a5500756ac1b4ec6133f55fd584fa5c))
* **formatters/json:** CBOR と同様に __proto__ と constructor を安全ではないキーとみなす ([30b7357](https://github.com/tai-kun/surrealdb.js/commit/30b73570ef363e120cecf9373a400ce6dba5f97c))
* **scripts:** Vitest が報告するエラーのフォーマットを変更 ([4ef9e8e](https://github.com/tai-kun/surrealdb.js/commit/4ef9e8e3bd36ce1899b2e97f0d28f417464bd602))
* **surreal/surql:** メソッド名に統一感出す ([0750def](https://github.com/tai-kun/surrealdb.js/commit/0750def28a9baa79a3a3d4147823ef8cd8b5b41b))
* **surreal/surql:** 事前準備されたクエリーがエンコード前のクエリーを保持するようにする ([a0af5e5](https://github.com/tai-kun/surrealdb.js/commit/a0af5e59fa393880254b4b9b0fd9bced35f6e146))


### Features

* `insert_relation` を実装 ([5656331](https://github.com/tai-kun/surrealdb.js/commit/56563318b9b7a8a94d35865e4818ed2fcdfb776e))
* **clients/basic:** デフォルトのエラーハンドラーをオフにするオプションを追加 ([5906a2b](https://github.com/tai-kun/surrealdb.js/commit/5906a2bc75a297b4e38009496838d5d14416da6b))
* **clients/standard:** Jwt に `.getMillisecondsUntilExpiration` を追加 ([70645a9](https://github.com/tai-kun/surrealdb.js/commit/70645a9d90d91e1e23559d3c3a0d5ca1998b7033))
* **clients/standard:** JWT を安全に扱いやすくする。 ([930126b](https://github.com/tai-kun/surrealdb.js/commit/930126b128368b3b80f6b91751c99144df04683a))
* **clients:** basic クライアントと standard クライアントを追加 ([f33719c](https://github.com/tai-kun/surrealdb.js/commit/f33719cc28faeada671e6deff3702180fa6fef99))
* **data-types:** .structure メソッドを追加 ([959966e](https://github.com/tai-kun/surrealdb.js/commit/959966ec022f365192e35848228c4e863055c0f8))
* **data-types/encodable:** Thing を ID ジェネレーターに対応させる ([11cc58c](https://github.com/tai-kun/surrealdb.js/commit/11cc58c5f9f84f0e1be5ce8b755c09f9795dc42b))
* **data-types/standard:** `Future`と `Range` 関連に `.clone()` メソッドを生やす ([#39](https://github.com/tai-kun/surrealdb.js/issues/39)) ([2979052](https://github.com/tai-kun/surrealdb.js/commit/2979052a45a50bc527143033018455136bebeb65))
* **data-types/standard:** GeometryLine にリング系のプロパティーを追加 ([64877f6](https://github.com/tai-kun/surrealdb.js/commit/64877f6e74b0ca419d6cc8029a743158abde3c87))
* **data-types:** `Bound` に型パラメーターを追加する ([853a5fc](https://github.com/tai-kun/surrealdb.js/commit/853a5fce5e399821bbdbfc03c2da36b722d421c4))
* **data-types:** Table を追加 ([e8b5278](https://github.com/tai-kun/surrealdb.js/commit/e8b52789765cb92e6189713430dc9770e1be3537))
* **data-types:** Thing を追加 ([2557860](https://github.com/tai-kun/surrealdb.js/commit/255786065f4bff8ad36f1a83b7ea4914dd1156fd))
* **data-types:** Uuid を追加 ([d05b388](https://github.com/tai-kun/surrealdb.js/commit/d05b388f4bbbe3ea22bc55e9f7ac9ba396defa62))
* **data-types:** 実験的な `Future` を実装 ([0ebdadd](https://github.com/tai-kun/surrealdb.js/commit/0ebdadd507bf060bb30e406201452d9d04eaa32a))
* **data-types:** 実験的な `Range` を実装 ([0874743](https://github.com/tai-kun/surrealdb.js/commit/08747437eafd0bd768254c1bde2c65c947a2c3ce))
* **engines/http:** HTTP エンジンに RPC レスポンスのイベントを追加 ([#41](https://github.com/tai-kun/surrealdb.js/issues/41)) ([64235ba](https://github.com/tai-kun/surrealdb.js/commit/64235bad5f6c5aab9f70dc744c9bb1538ae9a10d))
* **engines/websocket:** `use` メソッドの機能強化 ([526efb1](https://github.com/tai-kun/surrealdb.js/commit/526efb14ff4b6f2750cca04c71f581681ea491c1))
* **formatters/cbor:** CBOR のエンコーダーとデコーダーを追加 ([27a66ce](https://github.com/tai-kun/surrealdb.js/commit/27a66ced0c7981dd8648287a56642eb017138e16))
* **formatters:** json フォーマッターと cbor フォーマッターを追加 ([df0fe13](https://github.com/tai-kun/surrealdb.js/commit/df0fe1321223e6ac360d33ca849e0bfcf6aeeba9))
* http エンジンと websocket エンジンを追加 ([6fa7a40](https://github.com/tai-kun/surrealdb.js/commit/6fa7a4025be8348daf01c57146c72b8949d0b8c1))
* **surreal/surql:** `.as` のエイリアスに `.type`、`.to` のエイリアスに `.toransform` ([b022a25](https://github.com/tai-kun/surrealdb.js/commit/b022a25c38f20c650965fd86d3023b844d6c5aaf))
* **surreal:** 1 回限りの RPC を実行する関数を追加 ([fbf82c4](https://github.com/tai-kun/surrealdb.js/commit/fbf82c46b16556dba96255168b2096cb76e039ca))
* **surreal:** initSurreal とデフォルトの Surreal を追加 ([2c988d8](https://github.com/tai-kun/surrealdb.js/commit/2c988d8a93c39ba5ef78d8914e2061e357f85d5f))
* **surreal:** SurrealQL に文字列を埋め込む surql.raw を追加 ([4bff2a6](https://github.com/tai-kun/surrealdb.js/commit/4bff2a67e13b934d0e95dd13b94ab8ab0a97b107))
* **surreal:** SurrealQL を事前定義する関数を実験的に追加 ([6c35d2a](https://github.com/tai-kun/surrealdb.js/commit/6c35d2ad8c61d9fb3e13de78d5a72b493affddfa))
* **surreal:** エンドポイントを自動変形させないためのオプションを追加 ([cdb90bc](https://github.com/tai-kun/surrealdb.js/commit/cdb90bc81ce0135a97fb383128da669b001253f9))
* **surreal:** スロットに値を検証する機能を追加 ([81fefe8](https://github.com/tai-kun/surrealdb.js/commit/81fefe84dfdc5256c6984b702ee4cf3f233bd7d4))
* ライブクエリーに `record` プロパティを追加 ([94ca01c](https://github.com/tai-kun/surrealdb.js/commit/94ca01c8bf9b21cc116f034ca4094a1ea7728641))
* 事前に定義されたクエリーに後から変数を割り当てる機能を追加 ([1ee76a8](https://github.com/tai-kun/surrealdb.js/commit/1ee76a8c27b021a49eb2dd3060874b3562f175dc))
* 実験的な `graphql` を実装 ([f7c4e58](https://github.com/tai-kun/surrealdb.js/commit/f7c4e58b46b42dcf5cf5fecbcce9e94389fdcdd8))


### Bug Fixes

* `~/` エイリアスを削除 ([95eb7e9](https://github.com/tai-kun/surrealdb.js/commit/95eb7e9ef4c38a9c668247969c3310326dbaa9c1))
* **cbor:** `undefined` のエンコードを SurrealDB 式に合わせる ([e9f46a3](https://github.com/tai-kun/surrealdb.js/commit/e9f46a3768bc5727ad352349443976ed88999ab6))
* **cbor:** Lexcer を終了する前にループを抜け出す ([310e4f3](https://github.com/tai-kun/surrealdb.js/commit/310e4f3ad8733fdbde8bc2cce9aa27808a36debe))
* **cbor:** lexer の制限に関するバグを修正 ([ecad937](https://github.com/tai-kun/surrealdb.js/commit/ecad937d26aaf7e5623acf6fa3fee3d0005de009))
* **cbor:** maxDepth + 1 までネストできていた不具合を修正 ([a12aecb](https://github.com/tai-kun/surrealdb.js/commit/a12aecb35e763a4a7d1bc349c2a2ea710f9553ca))
* **cbor:** SurrealDB との互換性を向上させる ([b7f7ea4](https://github.com/tai-kun/surrealdb.js/commit/b7f7ea4950f15c1cf50b6f832ff1ef32337e322c))
* **cbor:** toCBOR で Writer に書き込むとエンコードが終わらないバグを修正 ([b5dd88e](https://github.com/tai-kun/surrealdb.js/commit/b5dd88eb0c4cd26fa9aebfb237a87d0272977e0a))
* **cbor:** エンコード時の循環参照エラーを追加 ([259061f](https://github.com/tai-kun/surrealdb.js/commit/259061fb70113bd3950af0b8f313fc5a8900eb45))
* **cbor:** タグ付きデータアイテムの値がエンコードされないバグを修正 ([8c81ad5](https://github.com/tai-kun/surrealdb.js/commit/8c81ad59154108db255f5c301e41ef18cab83328))
* **cbor:** タンクサイズを超える入力が合った時にエンコードに失敗する不具合を修正 ([e6d1439](https://github.com/tai-kun/surrealdb.js/commit/e6d1439b12cc7ba836f03be1ef7417ab824aa827))
* **cbor:** ネストされたオブジェクトのエンコード時に循環参照を検知できないことがる不具合を修正 ([8a8674a](https://github.com/tai-kun/surrealdb.js/commit/8a8674a1261d414b70f372543af85952de8e7887))
* **cbor:** バッファーの必要サイズの要求時に安全な整数値を超える可能性がある ([8109455](https://github.com/tai-kun/surrealdb.js/commit/8109455c936338547f7cfc34ced98011b9774c44))
* **cbor:** 不定長文字列内に不定長文字列を入れてエラーにならない不具合を修正 ([92cc063](https://github.com/tai-kun/surrealdb.js/commit/92cc063ff0fec2be2f9822c44d5fb69c7af021f2))
* **clients/standard:** `graphql` の API を修正 ([8a63cbf](https://github.com/tai-kun/surrealdb.js/commit/8a63cbf3a0a5e3e6ddf94c2337d37a1714f66c8d))
* **clients/standard:** `insert` の引数であるテーブル名をオプションにする ([3e95f30](https://github.com/tai-kun/surrealdb.js/commit/3e95f3044edf615156f06ab41d2eba581b9f77b2))
* **clients/standard:** クエリーの変数を必須にする条件を修正 ([9a85f64](https://github.com/tai-kun/surrealdb.js/commit/9a85f64131129c783aeb9abd8fde45580af80ae6))
* **clients/standard:** 型を修正 ([56b138f](https://github.com/tai-kun/surrealdb.js/commit/56b138fdce5cc69d21f244cdf802413d9e9f7a45))
* **clients/standard:** 変数名と型を自明に ([9d88437](https://github.com/tai-kun/surrealdb.js/commit/9d88437fb3aee51d60c1e60423ff210f7ddd32be))
* **clients:** `use` メソッドで null と undefined を区別する ([b38d0e8](https://github.com/tai-kun/surrealdb.js/commit/b38d0e809b4684b590de1737ae9d1cdcae422518))
* **data-types/decode-only:** Datetime が -0 を 0 にしない不具合を修正 ([622a263](https://github.com/tai-kun/surrealdb.js/commit/622a26326d53977c495f05512ab3b5e2a232759e))
* **data-types/encodable:** typo ([c6b0310](https://github.com/tai-kun/surrealdb.js/commit/c6b03107a43455eee219ace8aa77e26d3bdb3b26))
* **data-types/encodable:** ファイルパスを修正 ([dba6642](https://github.com/tai-kun/surrealdb.js/commit/dba664250e78d6ad547158f0299054f64798e203))
* **data-types/standard:** Decimal のstructure を encodable から拡張する ([9c64683](https://github.com/tai-kun/surrealdb.js/commit/9c646831a7b97bedec115c6d9624ec1b8ccdebe8))
* **data-types/standard:** Duration の `set` を `sub` に修正 ([5233ee1](https://github.com/tai-kun/surrealdb.js/commit/5233ee1ddbd67dfa58f7ddc5c61510e373b54f54))
* **data-types:** `Range` の　SurrealQL 表現を修正 ([a2702d6](https://github.com/tai-kun/surrealdb.js/commit/a2702d6852f73ccb3e6734d4e0f63621cb3c7914))
* **data-types:** multiline -&gt; multilinestring ([d5a21fb](https://github.com/tai-kun/surrealdb.js/commit/d5a21fbd7e75d042fdf93c2d5b17a0219172e74b))
* **data-types:** Thing の id の型を改善 ([ee8f24a](https://github.com/tai-kun/surrealdb.js/commit/ee8f24aefef68a258024ada9930044d4ab67d39a))
* **data-types:** 継承元の型を export ([fd67887](https://github.com/tai-kun/surrealdb.js/commit/fd6788771843da1e931af0ff01ee757855c2083e))
* Duration の型を修正 ([f28e01f](https://github.com/tai-kun/surrealdb.js/commit/f28e01fc47ee226affeea0efa4058deb45526c9a))
* **engines/http:** 名前空間とデータベースのから文字列を許可する ([e69b5f6](https://github.com/tai-kun/surrealdb.js/commit/e69b5f6b27a532135c37e7d107d56d1e8d1b1eb5))
* **engines/websocket:** 3000 番台のステータスコードで iana に登録されているコードを避ける ([7fa876d](https://github.com/tai-kun/surrealdb.js/commit/7fa876d9b15b1a7bb9cbb5d5502f901c264fe6a0))
* **engines/websocket:** Blob に対応する ([f09326d](https://github.com/tai-kun/surrealdb.js/commit/f09326d219008b1e32de9d998cc160988ce7131b))
* **engines/websocket:** close イベント内のエラーを送信する ([c416eb7](https://github.com/tai-kun/surrealdb.js/commit/c416eb75ca6f3147294d7a0444ba728d2e767393))
* **engines/websocket:** ライブクエリの結果をすべて受け取る ([95f6c42](https://github.com/tai-kun/surrealdb.js/commit/95f6c4252b5b7d48fe7bcc2b7b0ff5bddcd6e713))
* **engines/websocket:** 予約済みのステータスコードをエラーとして扱わない ([2e6d97d](https://github.com/tai-kun/surrealdb.js/commit/2e6d97dbb4dfc027e35c2783e0d3755a4d2f523b))
* **engine:** 名前空間とデータベース選択に関するバグを修正 ([5fc1f78](https://github.com/tai-kun/surrealdb.js/commit/5fc1f78a41f668b421a6f4d5eeb60f4f2d66ae42))
* **engine:** 接続情報の命名ミスを修正 ([cf47291](https://github.com/tai-kun/surrealdb.js/commit/cf472917201e09bcaba79f69e9831ad8d14e6596))
* **engine:** 遷移時の状態をエラーメッセージに反映できていなかった不具合を修正 ([e955a5f](https://github.com/tai-kun/surrealdb.js/commit/e955a5f29ac886baa059e0ff469a6ea6ce47e194))
* **errors:** .toSorted() が使えない環境に対応 ([1c1cd38](https://github.com/tai-kun/surrealdb.js/commit/1c1cd384696309978dbb4fb42df915626e4fa196))
* **errors:** 古いブラウザーをサポートするために静的初期化ブロックを使わない ([314bbae](https://github.com/tai-kun/surrealdb.js/commit/314bbae881e51ebcf9c12ed7a786047705978e40))
* experimental 属性のつけ忘れ ([131f49f](https://github.com/tai-kun/surrealdb.js/commit/131f49fcd95f4ff942f5b9ebc282a115b3ff105a))
* **formatters/cbor:** Buffer 判定をして Uint8Array にする。 ([b19f163](https://github.com/tai-kun/surrealdb.js/commit/b19f1635bfa956380fda2892325b89dd1128dc63))
* **formatters/cbor:** UUID のタグ付けを修正 ([7420a89](https://github.com/tai-kun/surrealdb.js/commit/7420a89a7ad7b2f001e1d1cf47d48dfaaaa11bf0))
* **formatters/cbor:** デフォルトで実験的機能を実装しない ([06c1146](https://github.com/tai-kun/surrealdb.js/commit/06c1146d021170a0612603d0be354fbb2c3a793c))
* **formatters/json:** 不変にする ([ef7cd13](https://github.com/tai-kun/surrealdb.js/commit/ef7cd13ee8e931ff8f8b8853149403812d131272))
* **formatters:** Buffer をすべて使う ([0e2e433](https://github.com/tai-kun/surrealdb.js/commit/0e2e4332dfaa443b89b0444ac7c28de95a90d80c))
* **formatter:** Sec-Websocket-Protocol ヘッダーを必ず指定する ([5ba5757](https://github.com/tai-kun/surrealdb.js/commit/5ba5757fd050e7d36be2b7001c6919d2b0ab78b7))
* insert の型を修正 ([3048988](https://github.com/tai-kun/surrealdb.js/commit/30489882a03bcec48cafdb097954c489180d6511))
* pinger を正しく終了させる ([c879c14](https://github.com/tai-kun/surrealdb.js/commit/c879c148c93e384f17d49bc7f402ae612562cdb6))
* PR ([e8597bb](https://github.com/tai-kun/surrealdb.js/commit/e8597bbc3c3be8f3f1969b1f488ccab87ef224e5))
* size-limit でインポートする値を修正 ([a4c583f](https://github.com/tai-kun/surrealdb.js/commit/a4c583fc290784c410473a55fe49afa8e4e803c0))
* **surreal/inline:** インライン RPC に `graphql` を追加 ([368c9e1](https://github.com/tai-kun/surrealdb.js/commit/368c9e1b439865b64433c46bad15cdaa6487142e))
* **surreal/utils:** WebSocket でステータスコードが `1012` `1013` なら再接続を試みる。 ([533f8c2](https://github.com/tai-kun/surrealdb.js/commit/533f8c2b6b0eaef9d7a232ab0bd85b6e3a2adab8))
* **surreal:** rpc に非同期デコードを実装し忘れた ([f4516e5](https://github.com/tai-kun/surrealdb.js/commit/f4516e548d89fc53f507f54c080507a13c0d09d4))
* **surreal:** クライエントに引数をすべて渡せていなかった ([92549e7](https://github.com/tai-kun/surrealdb.js/commit/92549e726ad30700f996b35987919338609842fe))
* **surreal:** スロットの .required でデフォルト値が引き継がれる不具合を修正 ([3bd2ad5](https://github.com/tai-kun/surrealdb.js/commit/3bd2ad5816598f6c9d15e1fd6f4bb430c07d3861))
* **surreal:** 特定の変数名から始まるスロットでエラー ([eb6c600](https://github.com/tai-kun/surrealdb.js/commit/eb6c600347a6e4ca8b323fc9977536a036349535))
* trait に検証項目を追加 ([35e2784](https://github.com/tai-kun/surrealdb.js/commit/35e2784bddf6ae381a5d5d832e4959d8bc7fec53))
* **types:** 命名に一貫性をもたせる ([260eeae](https://github.com/tai-kun/surrealdb.js/commit/260eeaead84a9a374f8810bb4e8c2ea6019b89ad))
* **utils:** API リファレンスの URL を修正 ([8c08770](https://github.com/tai-kun/surrealdb.js/commit/8c08770229ee1a9424f728adc99c373fae1fe445))
* **utils:** isLiveResult で record プロパティーの存在を確認する ([553e325](https://github.com/tai-kun/surrealdb.js/commit/553e32587c2875e33c8afd3991e44e0eac78c27e))
* **utils:** StatefulPromise が Promise で解決できない不具合を修正 ([767bc88](https://github.com/tai-kun/surrealdb.js/commit/767bc88c0f9fb6a2a84133fd5c4032c8874e01bd))
* **utils:** toSurql CBOR 形式にできる値を受け入れるようにする ([58e0351](https://github.com/tai-kun/surrealdb.js/commit/58e03519bb26071be4594a189f1fb01d2780bdc9))
* **utils:** プレーンオブジェクトの判定をより厳格に行う ([28846ca](https://github.com/tai-kun/surrealdb.js/commit/28846ca1a05e48300b6a6557c6104b515abc4e18))
* **utils:** レコード ID のエスケープを修正 ([ab00006](https://github.com/tai-kun/surrealdb.js/commit/ab0000645311b7c481d4f4147aaeb8ad772fef9d))


### Code Refactoring

* v2 ([a81cf50](https://github.com/tai-kun/surrealdb.js/commit/a81cf504313c08b5f978f3f3268f0996c1607cc8))

## [2.0.0-beta.3](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2024-09-24)


### Bug Fixes

* **data-types/encodable:** ファイルパスを修正 ([dba6642](https://github.com/tai-kun/surrealdb.js/commit/dba664250e78d6ad547158f0299054f64798e203))

## [2.0.0-beta.2](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2024-09-24)


### ⚠ BREAKING CHANGES

* **data-types:** `tb` を `table` に改名

### Changes

* **data-types:** `tb` を `table` に改名 ([72809e0](https://github.com/tai-kun/surrealdb.js/commit/72809e01170d54c4d8a6a009876f5e67f7e30e6d))


### Features

* **data-types:** `Bound` に型パラメーターを追加する ([853a5fc](https://github.com/tai-kun/surrealdb.js/commit/853a5fce5e399821bbdbfc03c2da36b722d421c4))


### Bug Fixes

* **utils:** プレーンオブジェクトの判定をより厳格に行う ([28846ca](https://github.com/tai-kun/surrealdb.js/commit/28846ca1a05e48300b6a6557c6104b515abc4e18))

## [2.0.0-beta.1](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2024-09-22)


### Features

* `insert_relation` を実装 ([5656331](https://github.com/tai-kun/surrealdb.js/commit/56563318b9b7a8a94d35865e4818ed2fcdfb776e))
* **surreal/surql:** `.as` のエイリアスに `.type`、`.to` のエイリアスに `.toransform` ([b022a25](https://github.com/tai-kun/surrealdb.js/commit/b022a25c38f20c650965fd86d3023b844d6c5aaf))
* 実験的な `graphql` を実装 ([f7c4e58](https://github.com/tai-kun/surrealdb.js/commit/f7c4e58b46b42dcf5cf5fecbcce9e94389fdcdd8))


### Bug Fixes

* **clients/standard:** `graphql` の API を修正 ([8a63cbf](https://github.com/tai-kun/surrealdb.js/commit/8a63cbf3a0a5e3e6ddf94c2337d37a1714f66c8d))
* **clients/standard:** `insert` の引数であるテーブル名をオプションにする ([3e95f30](https://github.com/tai-kun/surrealdb.js/commit/3e95f3044edf615156f06ab41d2eba581b9f77b2))
* **surreal/inline:** インライン RPC に `graphql` を追加 ([368c9e1](https://github.com/tai-kun/surrealdb.js/commit/368c9e1b439865b64433c46bad15cdaa6487142e))

## [2.0.0-alpha.8](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2024-09-22)


### Changes

* **engines/websocket:** 名前空間とデータベースの矛盾を検知しない ([9bdbc58](https://github.com/tai-kun/surrealdb.js/commit/9bdbc5826a5500756ac1b4ec6133f55fd584fa5c))


### Bug Fixes

* **surreal/utils:** WebSocket でステータスコードが `1012` `1013` なら再接続を試みる。 ([533f8c2](https://github.com/tai-kun/surrealdb.js/commit/533f8c2b6b0eaef9d7a232ab0bd85b6e3a2adab8))

## [2.0.0-alpha.7](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2024-09-20)


### ⚠ BREAKING CHANGES

* **data-types/standard:** Duration の `set` を `sub` に修正

### Bug Fixes

* **data-types/standard:** Duration の `set` を `sub` に修正 ([5233ee1](https://github.com/tai-kun/surrealdb.js/commit/5233ee1ddbd67dfa58f7ddc5c61510e373b54f54))
* **data-types:** `Range` の　SurrealQL 表現を修正 ([a2702d6](https://github.com/tai-kun/surrealdb.js/commit/a2702d6852f73ccb3e6734d4e0f63621cb3c7914))

## [2.0.0-alpha.6](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2024-09-18)


### Changes

* **surreal/surql:** 事前準備されたクエリーがエンコード前のクエリーを保持するようにする ([a0af5e5](https://github.com/tai-kun/surrealdb.js/commit/a0af5e59fa393880254b4b9b0fd9bced35f6e146))


### Features

* **data-types:** 実験的な `Future` を実装 ([0ebdadd](https://github.com/tai-kun/surrealdb.js/commit/0ebdadd507bf060bb30e406201452d9d04eaa32a))
* **data-types:** 実験的な `Range` を実装 ([0874743](https://github.com/tai-kun/surrealdb.js/commit/08747437eafd0bd768254c1bde2c65c947a2c3ce))
* ライブクエリーに `record` プロパティを追加 ([94ca01c](https://github.com/tai-kun/surrealdb.js/commit/94ca01c8bf9b21cc116f034ca4094a1ea7728641))


### Bug Fixes

* **cbor:** `undefined` のエンコードを SurrealDB 式に合わせる ([e9f46a3](https://github.com/tai-kun/surrealdb.js/commit/e9f46a3768bc5727ad352349443976ed88999ab6))
* **cbor:** SurrealDB との互換性を向上させる ([b7f7ea4](https://github.com/tai-kun/surrealdb.js/commit/b7f7ea4950f15c1cf50b6f832ff1ef32337e322c))
* **clients/standard:** 型を修正 ([56b138f](https://github.com/tai-kun/surrealdb.js/commit/56b138fdce5cc69d21f244cdf802413d9e9f7a45))
* **data-types:** multiline -&gt; multilinestring ([d5a21fb](https://github.com/tai-kun/surrealdb.js/commit/d5a21fbd7e75d042fdf93c2d5b17a0219172e74b))
* **utils:** isLiveResult で record プロパティーの存在を確認する ([553e325](https://github.com/tai-kun/surrealdb.js/commit/553e32587c2875e33c8afd3991e44e0eac78c27e))

## [2.0.0-alpha.5](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2024-09-16)


### ⚠ BREAKING CHANGES

* **formatter:** Sec-Websocket-Protocol ヘッダーを必ず指定する
* **clients/standard:** Jwt の `.getTimeUntilExpiration` を `.getSecondsUntilExpiration` に変更

### Changes

* **clients/standard:** Jwt の `.getTimeUntilExpiration` を `.getSecondsUntilExpiration` に変更 ([c4bd5da](https://github.com/tai-kun/surrealdb.js/commit/c4bd5da9308ee4f7825687b535b47153ee3a5b9d))


### Features

* **clients/standard:** Jwt に `.getMillisecondsUntilExpiration` を追加 ([70645a9](https://github.com/tai-kun/surrealdb.js/commit/70645a9d90d91e1e23559d3c3a0d5ca1998b7033))


### Bug Fixes

* **engines/websocket:** ライブクエリの結果をすべて受け取る ([95f6c42](https://github.com/tai-kun/surrealdb.js/commit/95f6c4252b5b7d48fe7bcc2b7b0ff5bddcd6e713))
* **formatter:** Sec-Websocket-Protocol ヘッダーを必ず指定する ([5ba5757](https://github.com/tai-kun/surrealdb.js/commit/5ba5757fd050e7d36be2b7001c6919d2b0ab78b7))

## [2.0.0-alpha.4](https://github.com/tai-kun/surrealdb.js/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2024-09-12)


### ⚠ BREAKING CHANGES

* **surreal/surql:** メソッド名に統一感出す

### Changes

* **surreal/surql:** メソッド名に統一感出す ([0750def](https://github.com/tai-kun/surrealdb.js/commit/0750def28a9baa79a3a3d4147823ef8cd8b5b41b))

## [2.0.0-alpha.3](https://github.com/tai-kun/surrealdb.js/compare/v1.4.2...v2.0.0-alpha.3) (2024-09-11)


### ⚠ BREAKING CHANGES

* disconnect を close に改名
* v2

### Changes

* disconnect を close に改名 ([a4588a9](https://github.com/tai-kun/surrealdb.js/commit/a4588a96eb84773321f93aebe5e0e82b0827860f))
* **formatters/json:** CBOR と同様に __proto__ と constructor を安全ではないキーとみなす ([30b7357](https://github.com/tai-kun/surrealdb.js/commit/30b73570ef363e120cecf9373a400ce6dba5f97c))
* **scripts:** Vitest が報告するエラーのフォーマットを変更 ([4ef9e8e](https://github.com/tai-kun/surrealdb.js/commit/4ef9e8e3bd36ce1899b2e97f0d28f417464bd602))


### Features

* **surreal:** SurrealQL に文字列を埋め込む surql.raw を追加 ([4bff2a6](https://github.com/tai-kun/surrealdb.js/commit/4bff2a67e13b934d0e95dd13b94ab8ab0a97b107))
* **surreal:** エンドポイントを自動変形させないためのオプションを追加 ([cdb90bc](https://github.com/tai-kun/surrealdb.js/commit/cdb90bc81ce0135a97fb383128da669b001253f9))
* **surreal:** 事前準備されたクエリーが持つ型を推論するユーティリティを追加 ([aa345be](https://github.com/tai-kun/surrealdb.js/commit/aa345be9630751ad140fb7dbb353d7437c38a41a))
* **surreal:** 事前準備されたクエリーが結果を変形できるようにする ([fea1e9d](https://github.com/tai-kun/surrealdb.js/commit/fea1e9de84b58aeefddae2ca2f695622c70b3da3))


### Bug Fixes

* `~/` エイリアスを削除 ([95eb7e9](https://github.com/tai-kun/surrealdb.js/commit/95eb7e9ef4c38a9c668247969c3310326dbaa9c1))
* **errors:** .toSorted() が使えない環境に対応 ([1c1cd38](https://github.com/tai-kun/surrealdb.js/commit/1c1cd384696309978dbb4fb42df915626e4fa196))
* insert の型を修正 ([3048988](https://github.com/tai-kun/surrealdb.js/commit/30489882a03bcec48cafdb097954c489180d6511))
* PR ([e8597bb](https://github.com/tai-kun/surrealdb.js/commit/e8597bbc3c3be8f3f1969b1f488ccab87ef224e5))
* trait に検証項目を追加 ([35e2784](https://github.com/tai-kun/surrealdb.js/commit/35e2784bddf6ae381a5d5d832e4959d8bc7fec53))
* **utils:** レコード ID のエスケープを修正 ([ab00006](https://github.com/tai-kun/surrealdb.js/commit/ab0000645311b7c481d4f4147aaeb8ad772fef9d))


### Code Refactoring

* v2 ([a81cf50](https://github.com/tai-kun/surrealdb.js/commit/a81cf504313c08b5f978f3f3268f0996c1607cc8))

## [1.4.2](https://github.com/tai-kun/surrealdb.js/compare/v1.4.1...v1.4.2) (2024-08-22)


### Bug Fixes

* **clients/standard:** 変数名と型を自明に ([9d88437](https://github.com/tai-kun/surrealdb.js/commit/9d88437fb3aee51d60c1e60423ff210f7ddd32be))
* **data-types/standard:** Decimal のstructure を encodable から拡張する ([9c64683](https://github.com/tai-kun/surrealdb.js/commit/9c646831a7b97bedec115c6d9624ec1b8ccdebe8))
* pinger を正しく終了させる ([c879c14](https://github.com/tai-kun/surrealdb.js/commit/c879c148c93e384f17d49bc7f402ae612562cdb6))
* **surreal:** クライエントに引数をすべて渡せていなかった ([92549e7](https://github.com/tai-kun/surrealdb.js/commit/92549e726ad30700f996b35987919338609842fe))

## [1.4.1](https://github.com/tai-kun/surrealdb.js/compare/v1.4.0...v1.4.1) (2024-08-16)


### Bug Fixes

* **cbor:** バッファーの必要サイズの要求時に安全な整数値を超える可能性がある ([8109455](https://github.com/tai-kun/surrealdb.js/commit/8109455c936338547f7cfc34ced98011b9774c44))
* **data-types/decode-only:** Datetime が -0 を 0 にしない不具合を修正 ([622a263](https://github.com/tai-kun/surrealdb.js/commit/622a26326d53977c495f05512ab3b5e2a232759e))
* **data-types/encodable:** typo ([c6b0310](https://github.com/tai-kun/surrealdb.js/commit/c6b03107a43455eee219ace8aa77e26d3bdb3b26))
* **data-types:** Thing の id の型を改善 ([ee8f24a](https://github.com/tai-kun/surrealdb.js/commit/ee8f24aefef68a258024ada9930044d4ab67d39a))
* **data-types:** 継承元の型を export ([fd67887](https://github.com/tai-kun/surrealdb.js/commit/fd6788771843da1e931af0ff01ee757855c2083e))
* experimental 属性のつけ忘れ ([131f49f](https://github.com/tai-kun/surrealdb.js/commit/131f49fcd95f4ff942f5b9ebc282a115b3ff105a))
* **formatters/cbor:** デフォルトで実験的機能を実装しない ([06c1146](https://github.com/tai-kun/surrealdb.js/commit/06c1146d021170a0612603d0be354fbb2c3a793c))
* typo ([3d066bd](https://github.com/tai-kun/surrealdb.js/commit/3d066bd39fd5e369db0f742f42caf55b5c0e5eae))
* Uint8Array に関連する型を修正 ([040b1f4](https://github.com/tai-kun/surrealdb.js/commit/040b1f4ae623b03b7fdae577be5d3aec49914cbe))
* WebSocket の自動選択を賢くする ([3288895](https://github.com/tai-kun/surrealdb.js/commit/328889572f1a27e22197b31bab7fd78aff184883))


### Performance Improvements

* **cbor:** 新しくバッファーを確保する回数を削減 ([c92b3fe](https://github.com/tai-kun/surrealdb.js/commit/c92b3fef700644fc97fa4242214c2e56fc80a00f))

## [1.4.0](https://github.com/tai-kun/surrealdb.js/compare/v1.3.0...v1.4.0) (2024-08-13)


### Features

* **surreal:** 実験的なクエリーユーティリティを追加 ([f31f7ff](https://github.com/tai-kun/surrealdb.js/commit/f31f7ffec349be8419415d3736f7a0d0ab974b8b))


### Bug Fixes

* **ci:** 不要なスクリプトを削除 ([83575cf](https://github.com/tai-kun/surrealdb.js/commit/83575cf602718ee765008d4e7e24e5b3b275ee4d))
* **ci:** 修正! ([18545f6](https://github.com/tai-kun/surrealdb.js/commit/18545f62c6f9c75b8767cfc18364697341321644))
* **surreal:** rpc に非同期デコードを実装し忘れた ([f4516e5](https://github.com/tai-kun/surrealdb.js/commit/f4516e548d89fc53f507f54c080507a13c0d09d4))


### Performance Improvements

* **cbor:** メモリ確保の回数を削減 ([a6c4bef](https://github.com/tai-kun/surrealdb.js/commit/a6c4bef57056485ac143f7fd47af597995c0dad3))

## [1.3.0](https://github.com/tai-kun/surrealdb.js/compare/v1.2.1...v1.3.0) (2024-08-07)


### Features

* **surreal:** スロットに値を検証する機能を追加 ([81fefe8](https://github.com/tai-kun/surrealdb.js/commit/81fefe84dfdc5256c6984b702ee4cf3f233bd7d4))
* **surreal:** 事前準備されたクエリーに返値を検証する機能を追加 ([0f034cf](https://github.com/tai-kun/surrealdb.js/commit/0f034cf095a411f9068beb6d65850ecd3ec4f29d))


### Bug Fixes

* **cbor:** Lexcer を終了する前にループを抜け出す ([310e4f3](https://github.com/tai-kun/surrealdb.js/commit/310e4f3ad8733fdbde8bc2cce9aa27808a36debe))
* **cbor:** lexer の制限に関するバグを修正 ([ecad937](https://github.com/tai-kun/surrealdb.js/commit/ecad937d26aaf7e5623acf6fa3fee3d0005de009))
* **cbor:** maxDepth + 1 までネストできていた不具合を修正 ([a12aecb](https://github.com/tai-kun/surrealdb.js/commit/a12aecb35e763a4a7d1bc349c2a2ea710f9553ca))
* **cbor:** タンクサイズを超える入力が合った時にエンコードに失敗する不具合を修正 ([e6d1439](https://github.com/tai-kun/surrealdb.js/commit/e6d1439b12cc7ba836f03be1ef7417ab824aa827))
* **cbor:** 不定長文字列内に不定長文字列を入れてエラーにならない不具合を修正 ([92cc063](https://github.com/tai-kun/surrealdb.js/commit/92cc063ff0fec2be2f9822c44d5fb69c7af021f2))
* **formatters/json:** 不変にする ([ef7cd13](https://github.com/tai-kun/surrealdb.js/commit/ef7cd13ee8e931ff8f8b8853149403812d131272))
* **surreal:** スロットの .required でデフォルト値が引き継がれる不具合を修正 ([3bd2ad5](https://github.com/tai-kun/surrealdb.js/commit/3bd2ad5816598f6c9d15e1fd6f4bb430c07d3861))
* **surreal:** 特定の変数名から始まるスロットでエラー ([eb6c600](https://github.com/tai-kun/surrealdb.js/commit/eb6c600347a6e4ca8b323fc9977536a036349535))
* 型を修正 ([939be31](https://github.com/tai-kun/surrealdb.js/commit/939be31f52599165d6a709dcdce6aeac8f0da75c))


### Performance Improvements

* **cbor:** lexer と decoder を統合する ([a9c0dfa](https://github.com/tai-kun/surrealdb.js/commit/a9c0dfa2a56cbe39f842dba43f4397327c9733ea))
* **cbor:** エンコードサイズが小さいときの速度を改善 ([0d2eaad](https://github.com/tai-kun/surrealdb.js/commit/0d2eaadc83d310a6becd656962e824a4bbdaa3d6))
* **formatters/json:** プリミティブ値のクローンパフォーマンスを向上 ([8b99ceb](https://github.com/tai-kun/surrealdb.js/commit/8b99ceb503a146fb6039ad8cc905902f8c0123d1))
* **surreal:** スロットのデフォルト値を事前にエンコードする ([70ca7e0](https://github.com/tai-kun/surrealdb.js/commit/70ca7e02e24374f57ac462008de1c73f1761884e))
* **surreal:** 事前準備されたクエリーのテキストを事前にエンコードしておく ([bf131bc](https://github.com/tai-kun/surrealdb.js/commit/bf131bc95a82cfae82be16238c9b851aae4fa212))
* **surreal:** 同じ処理をしない。 ([276b53d](https://github.com/tai-kun/surrealdb.js/commit/276b53d38a5d49476e6b92985f64fb0d6cd1572d))
* Uint8Array を継承する Buffer を許容する ([8170f6e](https://github.com/tai-kun/surrealdb.js/commit/8170f6e951af6a8de6b96066ca96fe58e17af688))

## [1.2.1](https://github.com/tai-kun/surrealdb.js/compare/v1.2.0...v1.2.1) (2024-08-05)


### Bug Fixes

* **cbor:** toCBOR で Writer に書き込むとエンコードが終わらないバグを修正 ([b5dd88e](https://github.com/tai-kun/surrealdb.js/commit/b5dd88eb0c4cd26fa9aebfb237a87d0272977e0a))


### Performance Improvements

* CBOR を事前にエンコードしておく ([05379e1](https://github.com/tai-kun/surrealdb.js/commit/05379e1311be5c6683e2baae36dcb3ec5d5e3552))

## [1.2.0](https://github.com/tai-kun/surrealdb.js/compare/v1.1.0...v1.2.0) (2024-08-04)


### Features

* **clients/standard:** JWT を安全に扱いやすくする。 ([930126b](https://github.com/tai-kun/surrealdb.js/commit/930126b128368b3b80f6b91751c99144df04683a))
* 事前に定義されたクエリーに後から変数を割り当てる機能を追加 ([1ee76a8](https://github.com/tai-kun/surrealdb.js/commit/1ee76a8c27b021a49eb2dd3060874b3562f175dc))


### Bug Fixes

* **clients/standard:** クエリーの変数を必須にする条件を修正 ([9a85f64](https://github.com/tai-kun/surrealdb.js/commit/9a85f64131129c783aeb9abd8fde45580af80ae6))
* **types:** 命名に一貫性をもたせる ([260eeae](https://github.com/tai-kun/surrealdb.js/commit/260eeaead84a9a374f8810bb4e8c2ea6019b89ad))

## [1.1.0](https://github.com/tai-kun/surrealdb.js/compare/v1.0.1...v1.1.0) (2024-08-04)


### Features

* **clients/basic:** デフォルトのエラーハンドラーをオフにするオプションを追加 ([5906a2b](https://github.com/tai-kun/surrealdb.js/commit/5906a2bc75a297b4e38009496838d5d14416da6b))
* **data-types:** .structure メソッドを追加 ([959966e](https://github.com/tai-kun/surrealdb.js/commit/959966ec022f365192e35848228c4e863055c0f8))
* **data-types/encodable:** Thing を ID ジェネレーターに対応させる ([11cc58c](https://github.com/tai-kun/surrealdb.js/commit/11cc58c5f9f84f0e1be5ce8b755c09f9795dc42b))
* **data-types/standard:** GeometryLine にリング系のプロパティーを追加 ([64877f6](https://github.com/tai-kun/surrealdb.js/commit/64877f6e74b0ca419d6cc8029a743158abde3c87))
* **surreal:** 1 回限りの RPC を実行する関数を追加 ([fbf82c4](https://github.com/tai-kun/surrealdb.js/commit/fbf82c46b16556dba96255168b2096cb76e039ca))
* **surreal:** SurrealQL を事前定義する関数を実験的に追加 ([6c35d2a](https://github.com/tai-kun/surrealdb.js/commit/6c35d2ad8c61d9fb3e13de78d5a72b493affddfa))


### Bug Fixes

* **cbor:** ネストされたオブジェクトのエンコード時に循環参照を検知できないことがる不具合を修正 ([8a8674a](https://github.com/tai-kun/surrealdb.js/commit/8a8674a1261d414b70f372543af85952de8e7887))
* **engines/http:** 名前空間とデータベースのから文字列を許可する ([e69b5f6](https://github.com/tai-kun/surrealdb.js/commit/e69b5f6b27a532135c37e7d107d56d1e8d1b1eb5))
* **engine:** 名前空間とデータベース選択に関するバグを修正 ([5fc1f78](https://github.com/tai-kun/surrealdb.js/commit/5fc1f78a41f668b421a6f4d5eeb60f4f2d66ae42))
* **engine:** 接続情報の命名ミスを修正 ([cf47291](https://github.com/tai-kun/surrealdb.js/commit/cf472917201e09bcaba79f69e9831ad8d14e6596))

## [1.0.1](https://github.com/tai-kun/surrealdb.js/compare/v1.0.0...v1.0.1) (2024-08-02)


### Bug Fixes

* **cbor:** エンコード時の循環参照エラーを追加 ([259061f](https://github.com/tai-kun/surrealdb.js/commit/259061fb70113bd3950af0b8f313fc5a8900eb45))
* **engines/websocket:** 3000 番台のステータスコードで iana に登録されているコードを避ける ([7fa876d](https://github.com/tai-kun/surrealdb.js/commit/7fa876d9b15b1a7bb9cbb5d5502f901c264fe6a0))
* **engines/websocket:** close イベント内のエラーを送信する ([c416eb7](https://github.com/tai-kun/surrealdb.js/commit/c416eb75ca6f3147294d7a0444ba728d2e767393))
* **engines/websocket:** 予約済みのステータスコードをエラーとして扱わない ([2e6d97d](https://github.com/tai-kun/surrealdb.js/commit/2e6d97dbb4dfc027e35c2783e0d3755a4d2f523b))
* **engine:** 遷移時の状態をエラーメッセージに反映できていなかった不具合を修正 ([e955a5f](https://github.com/tai-kun/surrealdb.js/commit/e955a5f29ac886baa059e0ff469a6ea6ce47e194))
* **utils:** toSurql CBOR 形式にできる値を受け入れるようにする ([58e0351](https://github.com/tai-kun/surrealdb.js/commit/58e03519bb26071be4594a189f1fb01d2780bdc9))

## 1.0.0 (2024-08-01)


### Features

* **cbor-values:** Datetime を追加 ([9f80696](https://github.com/tai-kun/surrealdb.js/commit/9f806960a6a3e758617fb9c888c4f592da62e256))
* **cbor-values:** Decimal を実装 ([8a303f3](https://github.com/tai-kun/surrealdb.js/commit/8a303f36ff9365aeb275b27e8b1ceb30a2e507e1))
* **cbor-values:** Duration を追加 ([214794c](https://github.com/tai-kun/surrealdb.js/commit/214794cf562d60ae8f8f516826095676b0e844fc))
* **cbor-values:** ジオメトリを追加 ([4e07f24](https://github.com/tai-kun/surrealdb.js/commit/4e07f24ba131110555146a169ac5ba792760d502))
* **cbor-values:** データ型を判定するための隠しプロパティを追加 ([25187b9](https://github.com/tai-kun/surrealdb.js/commit/25187b942a9f5e2d7a2f516660be1267f7ff0151))
* **clients:** basic クライアントと standard クライアントを追加 ([f33719c](https://github.com/tai-kun/surrealdb.js/commit/f33719cc28faeada671e6deff3702180fa6fef99))
* **data-types:** Table を追加 ([e8b5278](https://github.com/tai-kun/surrealdb.js/commit/e8b52789765cb92e6189713430dc9770e1be3537))
* **data-types:** Thing を追加 ([2557860](https://github.com/tai-kun/surrealdb.js/commit/255786065f4bff8ad36f1a83b7ea4914dd1156fd))
* **data-types:** Uuid を追加 ([d05b388](https://github.com/tai-kun/surrealdb.js/commit/d05b388f4bbbe3ea22bc55e9f7ac9ba396defa62))
* **engines/websocket:** `use` メソッドの機能強化 ([526efb1](https://github.com/tai-kun/surrealdb.js/commit/526efb14ff4b6f2750cca04c71f581681ea491c1))
* **engines:** WebSocket エンジンを追加 ([58fa2c5](https://github.com/tai-kun/surrealdb.js/commit/58fa2c5ee57c8cbeaff5f2c6120b9aa55e6d3077))
* **formatters/cbor:** CBOR のエンコーダーとデコーダーを追加 ([27a66ce](https://github.com/tai-kun/surrealdb.js/commit/27a66ced0c7981dd8648287a56642eb017138e16))
* **formatters:** CBOR フォーマッターを追加 ([3b3718d](https://github.com/tai-kun/surrealdb.js/commit/3b3718d657c84474063db096c7c6d1a9aec9e2a0))
* **formatters:** Experimental support for a record ID generator is being added to CBOR ([a63344a](https://github.com/tai-kun/surrealdb.js/commit/a63344aa2e19c8cc537a5070418c21ea3cf8aa28))
* **formatters:** json フォーマッターと cbor フォーマッターを追加 ([df0fe13](https://github.com/tai-kun/surrealdb.js/commit/df0fe1321223e6ac360d33ca849e0bfcf6aeeba9))
* http エンジンと websocket エンジンを追加 ([6fa7a40](https://github.com/tai-kun/surrealdb.js/commit/6fa7a4025be8348daf01c57146c72b8949d0b8c1))
* **models:** Client を実装 ([2358bf6](https://github.com/tai-kun/surrealdb.js/commit/2358bf637daceac3f0e6df9a32a525827bf9be58))
* **models:** Datetime を実装 ([9a032cf](https://github.com/tai-kun/surrealdb.js/commit/9a032cfad102fe733b53db6c7daefaf063dd31dd))
* **models:** Decimal を実装 ([5677bde](https://github.com/tai-kun/surrealdb.js/commit/5677bde8f79b47ffc470b4fa1daffd073128f434))
* **models:** Duration を実装 ([8349dc1](https://github.com/tai-kun/surrealdb.js/commit/8349dc1045731ec89bb417b8cf45f64de97dc98b))
* **models:** Table を実装 ([20fceb3](https://github.com/tai-kun/surrealdb.js/commit/20fceb3f283c482144a42ad48229d0b62aadc3ef))
* **models:** Thing を実装 ([01bece8](https://github.com/tai-kun/surrealdb.js/commit/01bece8a3aa9afaaf20216aad9e9bc452d355049))
* **models:** ジオメトリ関連を実装 ([9b79c3e](https://github.com/tai-kun/surrealdb.js/commit/9b79c3e34aa4ce51ab5d959272a99eba4c6b1921))
* **surreal:** initSurreal とデフォルトの Surreal を追加 ([2c988d8](https://github.com/tai-kun/surrealdb.js/commit/2c988d8a93c39ba5ef78d8914e2061e357f85d5f))
* SurrealQL のテンプレートリテラルを追加 ([c0c2451](https://github.com/tai-kun/surrealdb.js/commit/c0c245104cb6af4bcaf1113c1d72b1bc9233f9a0))
* SurrealQL の値の JavaScript 表現を SurrealQL に変換する機能を追加 ([4f071f4](https://github.com/tai-kun/surrealdb.js/commit/4f071f41734c4973d9b7d39fd6c334340e90c328))
* **types:** 型を色々追加 ([f471278](https://github.com/tai-kun/surrealdb.js/commit/f4712781128b2e04c13bd77a45f433093c0467e0))
* **utils:** getTimeoutSignal を追加 ([26b3146](https://github.com/tai-kun/surrealdb.js/commit/26b3146aff1130f29d91d66a95fd9a5aa840dd19))
* **utils:** isArrayBuffer を追加 ([765ffe3](https://github.com/tai-kun/surrealdb.js/commit/765ffe3ac24c802e96275ea014f68de2f2b35c2f))
* **utils:** isSafeNumber を追加 ([aac4bbd](https://github.com/tai-kun/surrealdb.js/commit/aac4bbdedb1fd9dfd758fa8a29579d849f110d8b))
* **utils:** makeAbortApi を追加 ([1e8a895](https://github.com/tai-kun/surrealdb.js/commit/1e8a89585f0acd7fc82d7868850270d02089abfc))
* **utils:** Serial を追加 ([55d5eac](https://github.com/tai-kun/surrealdb.js/commit/55d5eac7e579a7a8b234ce870ce0d482e4b73924))
* **utils:** StatefulPromise を追加 ([d51eadb](https://github.com/tai-kun/surrealdb.js/commit/d51eadb9c9e95cb1213998dc5f955f7bc68b6abd))
* **utils:** TaskEmitter を追加 ([621a30c](https://github.com/tai-kun/surrealdb.js/commit/621a30c411f16bdb1667ffc256befdb4e22ac3ff))
* **utils:** TaskQueue を追加 ([f10945e](https://github.com/tai-kun/surrealdb.js/commit/f10945e73b110748c47c0db652f038cdbf245cfc))
* **utils:** throwIdAborted を追加 ([d950b8c](https://github.com/tai-kun/surrealdb.js/commit/d950b8cf8a7c0b56d92e9aefa2ee2eb098113ad8))
* **utils:** エスケープ関連の関数を追加 ([9eac0d4](https://github.com/tai-kun/surrealdb.js/commit/9eac0d4ae039fd9484ce3a5c0927052cf8b6ac03))
* **validators:** NoopValidator を追加 ([716c3c1](https://github.com/tai-kun/surrealdb.js/commit/716c3c11741403eed13af1077ad97140ce043a75))
* **validators:** zod バリデーターを追加 ([ca7fe8c](https://github.com/tai-kun/surrealdb.js/commit/ca7fe8c4a8054e255aad69e53f6b4a299bf01135))


### Bug Fixes

* **cbor:** タグ付きデータアイテムの値がエンコードされないバグを修正 ([8c81ad5](https://github.com/tai-kun/surrealdb.js/commit/8c81ad59154108db255f5c301e41ef18cab83328))
* CI ([9df7708](https://github.com/tai-kun/surrealdb.js/commit/9df77086d293d4e39b97bfc7fb94beb0e880b863))
* CI ([3be3f56](https://github.com/tai-kun/surrealdb.js/commit/3be3f56f25a3acb8753046e28f4e87928c659403))
* **ci:** Bun のスクリプトを修正 ([254e9c7](https://github.com/tai-kun/surrealdb.js/commit/254e9c7bb3dfa66d896e74cbcb3006b425a531c8))
* **ci:** codecov にアップロードし忘れた ([6a82243](https://github.com/tai-kun/surrealdb.js/commit/6a822435e653a81399de2ac06601e884b96c3174))
* **ci:** dont use services ([f568d54](https://github.com/tai-kun/surrealdb.js/commit/f568d547559c1e9bd7fa0ecb5618554c1f6f4e2a))
* **ci:** Fix comment ([2f05c67](https://github.com/tai-kun/surrealdb.js/commit/2f05c675814ae760841417f74aee0ce036c0690a))
* **ci:** use single quotes ([3b4320c](https://github.com/tai-kun/surrealdb.js/commit/3b4320cfb28eed2bdcfafbdc8957324f64041044))
* **ci:** カナリアリリースのパッケージバージョンを修正 ([3e25d54](https://github.com/tai-kun/surrealdb.js/commit/3e25d54ff3edb6687c24232c5b71384e62f4f06a))
* **ci:** ブラウザのミディアムテストでスモールテストをしていたミスを修正 ([3aa98e8](https://github.com/tai-kun/surrealdb.js/commit/3aa98e82c41bf8174f2dbc1d35f2b5de5f553f2a))
* **clients:** `use` メソッドで null と undefined を区別する ([b38d0e8](https://github.com/tai-kun/surrealdb.js/commit/b38d0e809b4684b590de1737ae9d1cdcae422518))
* **docs:** リダイレクト時にハッシュが消える不具合を修正 ([2eda9b0](https://github.com/tai-kun/surrealdb.js/commit/2eda9b05887182db82f76b5504155b6011694b7e))
* Duration の型を修正 ([f28e01f](https://github.com/tai-kun/surrealdb.js/commit/f28e01fc47ee226affeea0efa4058deb45526c9a))
* **engines/websocket:** Blob に対応する ([f09326d](https://github.com/tai-kun/surrealdb.js/commit/f09326d219008b1e32de9d998cc160988ce7131b))
* **errors:** 古いブラウザーをサポートするために静的初期化ブロックを使わない ([314bbae](https://github.com/tai-kun/surrealdb.js/commit/314bbae881e51ebcf9c12ed7a786047705978e40))
* Fix deps ([84834e6](https://github.com/tai-kun/surrealdb.js/commit/84834e61f7fa166908109875dc7aaaa668a105f9))
* **formatters/cbor:** Buffer 判定をして Uint8Array にする。 ([b19f163](https://github.com/tai-kun/surrealdb.js/commit/b19f1635bfa956380fda2892325b89dd1128dc63))
* **formatters/cbor:** UUID のタグ付けを修正 ([7420a89](https://github.com/tai-kun/surrealdb.js/commit/7420a89a7ad7b2f001e1d1cf47d48dfaaaa11bf0))
* **formatters:** Buffer をすべて使う ([0e2e433](https://github.com/tai-kun/surrealdb.js/commit/0e2e4332dfaa443b89b0444ac7c28de95a90d80c))
* **internal:** TaskEmitter が複数の .once を使ったときに起こる不具合を修正 ([b3c692b](https://github.com/tai-kun/surrealdb.js/commit/b3c692b75f419890a6c157fbe0ef790a321d2a14))
* **models/tiny:** エラーハンドリングを改善 ([73fbb1c](https://github.com/tai-kun/surrealdb.js/commit/73fbb1c42b5814e3c1c73a6d1d0540dc72be9405))
* **models:** Datetime が無効なときフォーマットできないようにする ([3b746f7](https://github.com/tai-kun/surrealdb.js/commit/3b746f799ebf90361400e6aec6c147e0af755018))
* **models:** Thing のエスケープを修正 ([128f004](https://github.com/tai-kun/surrealdb.js/commit/128f004833fab9c5d0a5f18cb4201c32a99e66c7))
* **models:** ライブクエリーの結果の型を修正 ([831c4b9](https://github.com/tai-kun/surrealdb.js/commit/831c4b978c8be9b34824d577c05c0b56e6b17ef2))
* **models:** 空文字のエスケープ処理を修正 ([d721036](https://github.com/tai-kun/surrealdb.js/commit/d72103641c26cf101351123670bacc59be863778))
* **scripts/build:** ビルド後のファイルパスを修正 ([10c4acf](https://github.com/tai-kun/surrealdb.js/commit/10c4acff99564b68799792d97c29d509ab3faaa0))
* size-limit でインポートする値を修正 ([a4c583f](https://github.com/tai-kun/surrealdb.js/commit/a4c583fc290784c410473a55fe49afa8e4e803c0))
* **test-env/deno:** パッケージのファイルパスを修正 ([7bc6ab1](https://github.com/tai-kun/surrealdb.js/commit/7bc6ab150c1524a8c43993abcab375ae680e43a3))
* **test-env:** 1 つでもテストに失敗したら 0 以外のコードで終了させる ([34c4ebf](https://github.com/tai-kun/surrealdb.js/commit/34c4ebfb1c4b1afd67356684111a1e3ab68c4134))
* **test-env:** assert を Node 環境以外でも動くようにする ([db88ea6](https://github.com/tai-kun/surrealdb.js/commit/db88ea6989caf0f1a7cd261b296c41f90069e28f))
* **test-env:** Chrome と Firefox のミディアムテストで Surreal インスタンスを取得できない不具合を修正 ([ff21a79](https://github.com/tai-kun/surrealdb.js/commit/ff21a79b178bbc67fa4c271203f9ad3aa0ecd1fd))
* **test-env:** Deno でエラーが出る箇所を修正 ([2d42341](https://github.com/tai-kun/surrealdb.js/commit/2d42341481128278711fc432338c52ef7f5d3406))
* **test-env:** fix ([7a2fecd](https://github.com/tai-kun/surrealdb.js/commit/7a2fecd3ff7afab0bd4b611e105c422652c229c6))
* **test-env:** match と doesNotMatch を修正 ([5bb96c4](https://github.com/tai-kun/surrealdb.js/commit/5bb96c4fdd5cdcebf8f26510736505de9920ab93))
* **test-env:** match と doesNotMatch を修正 ([bc9e624](https://github.com/tai-kun/surrealdb.js/commit/bc9e6248639fd5c02be48f8b3da788ea7eab3992))
* **test-env:** match と doesNotMatch を修正 ([285f580](https://github.com/tai-kun/surrealdb.js/commit/285f5800d112ba049e113475c484599a4d5092cb))
* **test-env:** スモールテストでは SurrealDB のセットアップを無視する。 ([6791977](https://github.com/tai-kun/surrealdb.js/commit/6791977b9393f7cb0bf3c0ccd8715e6c9f96021f))
* **test-env:** パッケージのファイルパスを修正 ([891a66f](https://github.com/tai-kun/surrealdb.js/commit/891a66fac6c9435f702a9ebb693f310f11405070))
* **test-env:** ブラウザのテスト結果が成否しか出ない問題を修正 ([f5d013c](https://github.com/tai-kun/surrealdb.js/commit/f5d013cc14369dafbdbb8c3ab3bf72f48905f1d2))
* **test-env:** ブラウザ環境の判定を修正 ([79b336d](https://github.com/tai-kun/surrealdb.js/commit/79b336d02ecc7b562cd982a80e1d76a4887558fd))
* **test-env:** ポリフィルのオプションを修正して assert パッケージが読み込まれるようにする ([adc0b07](https://github.com/tai-kun/surrealdb.js/commit/adc0b07c447d2cb44f65bf1e4478909636b7075e))
* **test-env:** 依存関係の入れ忘れを修正 ([3937f07](https://github.com/tai-kun/surrealdb.js/commit/3937f079315d3fa190d7dbf30725c63c958c230d))
* **test-env:** 修正 ([6692ccc](https://github.com/tai-kun/surrealdb.js/commit/6692cccae51fa2f26222f66a85cad6ee34b7be88))
* **tests/small/cbor-values:** コンストラクターの引数を修正 ([a87cfdd](https://github.com/tai-kun/surrealdb.js/commit/a87cfddb1a4c23c46ee0b3532db99d8c0afc7e90))
* **tests/small/internal:** SurrealDbError の import 忘れを修正 ([fcf5179](https://github.com/tai-kun/surrealdb.js/commit/fcf517944bab61bd194fb256b403182f09722a21))
* **tests:** CBOR 限定のテストに JSON を含めていたミスを修正 ([4834c87](https://github.com/tai-kun/surrealdb.js/commit/4834c877375c5e2936d829c441d7fa157f3b09cf))
* **tests:** Fix connection info ([69092cb](https://github.com/tai-kun/surrealdb.js/commit/69092cbb1c423a61955bb55a945f0f77c183b4c1))
* **tests:** Node.js18 のためにテストを修正 ([b9e219d](https://github.com/tai-kun/surrealdb.js/commit/b9e219d3a9ac9ea234ad529992ac00cbcbd0a137))
* **tests:** WebKit 用のテストを別途用意 ([890df8c](https://github.com/tai-kun/surrealdb.js/commit/890df8cbdac8a72a0916aa957ea9b807aa4be387))
* **tests:** テスト環境と型の修正 ([5c6c621](https://github.com/tai-kun/surrealdb.js/commit/5c6c621c26399570d134fd723027040b122c3031))
* **tests:** ファイルパスを修正 ([f47da76](https://github.com/tai-kun/surrealdb.js/commit/f47da768052f6c9c7d4fd4c473ff7e5a91fba8f6))
* **tests:** 予期する値の変更ミスを修正 ([e9338cc](https://github.com/tai-kun/surrealdb.js/commit/e9338cc93aff577d256b940797eacbb89b7e424f))
* **tests:** 期待する値の設定ミスを修正 ([23a17a2](https://github.com/tai-kun/surrealdb.js/commit/23a17a2d86f1eab8a25ca22a8e3924fc133cbefa))
* **utils:** API リファレンスの URL を修正 ([8c08770](https://github.com/tai-kun/surrealdb.js/commit/8c08770229ee1a9424f728adc99c373fae1fe445))
* **utils:** StatefulPromise が Promise で解決できない不具合を修正 ([767bc88](https://github.com/tai-kun/surrealdb.js/commit/767bc88c0f9fb6a2a84133fd5c4032c8874e01bd))
* **validators:** void の許容値に null と undefined を追加 ([754fdc5](https://github.com/tai-kun/surrealdb.js/commit/754fdc5a7fe40d79277ee32a829ddc62ee0c1629))
* values/tiny を廃止して型を修正 ([cefd1a9](https://github.com/tai-kun/surrealdb.js/commit/cefd1a9e70a0134cdf3b46ac61c10e78fd723eaf))
* **values:** datetime の NaN 判定を修正 ([9f810e6](https://github.com/tai-kun/surrealdb.js/commit/9f810e600c6d4084d7b941f26b789cf64afeed1d))
* **values:** Fix the escaping in the build-in ID generation functions ([a74639a](https://github.com/tai-kun/surrealdb.js/commit/a74639a472d809534e6e8f321c1a591614360184))
* **value:** SurqlValue の重複を修正 ([d000bdc](https://github.com/tai-kun/surrealdb.js/commit/d000bdc227319112d837714fdcd853f95a0fc965))
* **value:** 互換性のない型を修正 ([9c986a2](https://github.com/tai-kun/surrealdb.js/commit/9c986a2323db5dd74391e501eb87603f592aca03))
* **value:** 文字列を必ず文字列型としてパースされるように接頭辞を追加 ([26a7605](https://github.com/tai-kun/surrealdb.js/commit/26a7605f5b8189b2e7e96a5cd2f2a5c049e91e80))
* おそらくBun以外修正 ([2412abe](https://github.com/tai-kun/surrealdb.js/commit/2412abe9f8171fe9135df2a9e65fa0538b07c734))
* テストのスクリプトを修正 ([6e75487](https://github.com/tai-kun/surrealdb.js/commit/6e75487d00b256474c185fdac4304b5c77f88d9c))
* 接続/切断テストで出た不具合を修正 ([0cd3edb](https://github.com/tai-kun/surrealdb.js/commit/0cd3edb3f16c5cd218cc7c5a48a1495120bb84be))


### Performance Improvements

* **models:** エスケープ処理を改善 ([c03b139](https://github.com/tai-kun/surrealdb.js/commit/c03b139a34f51c50ad8f246b430ce40eed427a36))
* **values:** プライベート/読み取り専用を型で表す ([6c17f55](https://github.com/tai-kun/surrealdb.js/commit/6c17f55621ae076ecf047b4932e10ce8f8885f0f))
