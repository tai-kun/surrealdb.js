[![Node.js](https://github.com/tai-kun/surrealdb-js/actions/workflows/nodejs.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/nodejs.yml)
[![Deno](https://github.com/tai-kun/surrealdb-js/actions/workflows/deno.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/deno.yml)
[![Bun](https://github.com/tai-kun/surrealdb-js/actions/workflows/bun.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/bun.yml)
[![Chrome](https://github.com/tai-kun/surrealdb-js/actions/workflows/chrome.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/chrome.yml)
[![Firefox](https://github.com/tai-kun/surrealdb-js/actions/workflows/firefox.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/firefox.yml)

[SurrealDB](https://github.com/surrealdb/surrealdb) の JavaScript/TypeScript クライアントライブラリです。公式の SDK がすでに [surrealdb.js](https://github.com/surrealdb/surrealdb.js) にありますが、こちらは個人的な用途が考慮された設計になっています。

## 公式 SDK との相違点

注: この README を書いている時点で公式 SDK のバージョンは 1.0.0-beta.9 です。

### カスタマイズ性

この SDK は次の 4 つのコンポーネントを組み合わせることができます:

1. エンジン: HTTP や WebSocket などの通信プロトコルを選択します。
2. フォーマッター: CBOR や JSON などのデータ形式を選択します。
3. バリデーター: ランタイムエラーを早期に検知するためのバリデーターを選択します。
4. クライアント: エンジン、フォーマッター、バリデーターを組み合わせて、様々なメソッドを提供します。

機能や堅牢性を重視するとバンドルサイズが大きくなりますが、必要な機能だけを選択することでバンドルサイズを抑えることができます。

また次のカスタマイズも可能です:

* グローバルパッチ無しに `fetch` と `WebSocket` を変えることができます。

### 親和性

SurrealQL のデータ型に可能な限り対応しています:

* `Datetime`: `Date` オブジェクトはミリ秒までしか扱えませんが、これはナノ秒まで扱えます。ただし精度がナノ秒に対応しているという意味ではなく、SurrealDB が `datetime` を提供したとき、その値を欠損させること無いという意味です。また `setMilliseconds` 以外にも `setMicroseconds` と `setNanoseconds` を利用できます。
* `Duration`: SurrealDB では 1 年を 365 日と定義して 1 年間を `1y` と表現できますが、`Duration` クラスを提供するライブラリはうるう年を考慮してこの `y` をサポートしないことがほとんどです。これは SurrealDB と同様に 1 年を 365 日と定義し、`y` をサポートしています。また `Duration` を文字列表現にするときのフォーマットも SurrealDB と同じです。
* `Uuid`: v1 から v7 までの UUID をサポートしています。またタイムスタンプ部を持つバージョンの UUID から、Unix エポックからの経過時間をミリ秒で取得できるなど、便利なメソッドを提供しています。

この他にも公式 SDK と同様に `Table` や `Thing` (`RecordID`)、`Geometry`、`Decimal` にも対応しています。

上記のデータ型は、バンドルサイズの微増を許容すれば `.toSurql()` メソッドを利用することができます。これは例えば次のように、データ型から直接 SurrealQL に埋め込める文字列を作成することができます:

```typescript
import { Datetime, Thing } from "@tai-kun/surrealdb";

const id = {
  string: "あいうえお😢",
  number: [
    123,
    3.14,
  ],
  bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
  boolean: [
    true,
    false,
  ],
  null: null,
  undefined: undefined,
  date: new Datetime(0),
};
const thing = new Thing("tb", id);
console.log(thing.toSurql());
// r"tb:{bigint:9007199254740992,boolean:[true,false],date:d'1970-01-01T00:00:00.000000000Z',null:NULL,number:[123,3.14],string:s'あいうえお😢',undefined:NONE}"
```

`r"<テーブル名>:<ID>"` という形式はレコード ID 形式の文字列であることをクエリーパーサーに伝える方法です。ID 内の null は `NULL` になり、undefined は `NONE` になっていることがわかります。`Datetime` は `d` プレフィックスを持ち、ナノ秒までの精度を持っていることがわかります。さらに文字列は `s` プレフィックスでそれが `string` であることをクエリーパーザーに伝えています。

ここで示した例以外にも細かなケアがなされています。例えば SurrealQL のオブジェクトのキーの引用符はシングルクォートとダブルクォートで挙動が異なりますが、この SDK では JavaScript で表現した値がそのまま SurrealQL に反映されるように適切にエスケープされるため、SurrealQL を直接記述する必要はありません。

### 安全性

注: 値の安全性はバリデーター次第です。

デフォルトで安全に設計されています:

* 主に非同期処理におけるリソースリークを防ぐことに注力しています。内部的にはリソースの作成と破棄が明示的に行われるため、特に破棄する際の Promise さえ `await` などでイベントループ内で処理されていれば、リソースリークを防ぐことができます。SDK 内のイベントを捕捉したりなど、何らかの非同期処理のコールバックを SDK に組み込みたい場合は、そのコールバックに渡される `signal` を利用することで、切断時に Promise などの各種リソースの破棄のタイミングが分かるようになっています。
* 必要に応じてタイムアウトを設定することもできますが、自動設定されている場合がほとんどであるため、無限に待機することはありません。
* タイムアウトを意図的に無限にしたり、中止シグナルを無視することがなければ、基本的に unhandledRejection やリソースリークを見る機会はありません。

### 互換性

公式 SDK では[ブラウザでの利用にあまり前向きではないようです](https://github.com/surrealdb/surrealdb.js/issues/251)が、この SDK では Chrome と Firefox でも動作するように実装しています。また次の実行環境でテストしています:

* Node.js v18.x, v20.x, v22.x
* Deno v1.x
* Bun v1.x
* Chrome >=100
* Firefox >=100

ただし、テストする際の事情やランタイムのバグによって、一部のテストが意図的にスキップされています。詳細は「[テスト](#テスト)」を参照してください。

## インストール


今のところ安定版あありませんが、カナリアリリースされたバージョンをインストールするには次のようにします:

```bash
npm i @tai-kun/surrealdb@canary
bun i @tai-kun/surrealdb@canary
pnpm i @tai-kun/surrealdb@canary
yarn add @tai-kun/surrealdb@canary
```

## 使い方

最初に `initSurreal` で `Surreal` クラスとその他ユーティリティを作成します。その際、用途に応じてエンジン、フォーマッター、バリデーターを選択します。

例えば、HTTP エンジン、JSON フォーマッター、バリデーターなし、一般的なクライアントで作成するには次のようにします:

```typescript
import { initSurreal } from "@tai-kun/surrealdb";
import { httpEngine } from "@tai-kun/surrealdb/engines";
import { JsonFormatter } from "@tai-kun/surrealdb/formatters";
import {
  Client
} from "@tai-kun/surrealdb/stardard"; // standard を選択することで、基本的な機能を利用できます。
import { EmptyValidator } from "@tai-kun/surrealdb/validators";

const {
  Surreal,
} = initSurreal({
  Client,
  engines: {
    http: httpEngine,
    https: "http",
  },
  Formatter: JsonFormatter,
  Validator: EmptyValidator,
});

async function main() {
  const db = new Surreal();

  try {
    await db.connect("http://localhost:8080");
    const [result] = await db.query<[string]>(/* surql */ `
      RETURN "Hello, World!";
    `);
    console.log(result); // Hello, World!
  } finally {
    await db.disconnect();
  }
}
```

`Surreal` インスタンスは `Symbol.asyncDispose` に対応しているため、次のように書くこともできます:
  
```typescript
async function main() {
  await using db = new Surreal();
  await db.connect("http://localhost:8080");
  const [result] = await db.query<[string]>(/* surql */ `
    RETURN "Hello, World!";
  `);

  console.log(result); // Hello, World!
}
```

`initSurreal` は SurrealQL を記述するためのユーティリティを提供しています:

```typescript
const {
  Surreal,
  surql,
} = initSurreal({
  Client,
  engines: {
    http: httpEngine,
    https: "http",
  },
  Formatter: JsonFormatter,
  Validator: EmptyValidator,
});

const helloWorldQuery = surql<[string]>`
  RETURN "Hello, World!";
`;

async function main() {
  await using db = new Surreal();
  await db.connect("http://localhost:8080");
  const [result] = await db.query(helloWorldQuery);
      // ^? const result: string

  console.log(result); // Hello, World!
}
```

次に、WebSocket エンジン、CBOR フォーマッター、バリデーターなし、全機能付きクライアントで作成するには次のようにします:

```typescript
import { initSurreal } from "@tai-kun/surrealdb";
import { webSocketEngine } from "@tai-kun/surrealdb/engines";
import { CborFormatter } from "@tai-kun/surrealdb/formatters";
import {
  Client,
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb/full"; // full を選択することで、全機能を利用できます。
import { EmptyValidator } from "@tai-kun/surrealdb/validators";

class Formatter extends CborFormatter {
  constructor() {
    super({
      Datetime,
      Decimal,
      Duration,
      GeometryCollection,
      GeometryLine,
      GeometryMultiLine,
      GeometryMultiPoint,
      GeometryMultiPolygon,
      GeometryPoint,
      GeometryPolygon,
      Table,
      Thing,
      Uuid,
    });
  }
}

const {
  Surreal,
} = initSurreal({
  Client,
  engines: {
    ws: webSocketEngine,
    wss: "ws",
  },
  Formatter,
  Validator: EmptyValidator,
});
```

## バンドルサイズ

### 小規模

利用シーン:

* バンドルサイズを気にしています。
* HTTP で通信します。
* データの表現は JSON で十分です。
* バリデーションは行いません。
* 基本的な機能を持つクライアントを利用します。

```typescript
// 約 7 KB (minify + gzip)
import { initSurreal } from "@tai-kun/surrealdb";
import { httpEngine } from "@tai-kun/surrealdb/engines";
import { JsonFormatter } from "@tai-kun/surrealdb/formatters";
import { Client } from "@tai-kun/surrealdb/stardard";
import { EmptyValidator } from "@tai-kun/surrealdb/validators";。
```

### 中規模

利用シーン:

* バンドルサイズを気にします。
* HTTP で通信します。
* CBOR による豊かなデータ表現が必要です。
* SurrealQL のデータ型の表現は、最小限で十分です。
* バリデーションは行いません。
* 基本的な機能を持つクライアントを利用します。

```typescript
// 約 14.5 KB (minify + gzip)
import { initSurreal } from "@tai-kun/surrealdb";
import { httpEngine } from "@tai-kun/surrealdb/engines";
import { CborFormatter } from "@tai-kun/surrealdb/formatters";
import { Client } from "@tai-kun/surrealdb/stardard";
import { EmptyValidator } from "@tai-kun/surrealdb/validators";
import {
  // tiny のクライアントを使わず、standard のクライアントを使うこともできます。
  // Client,
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb/tiny"; // tiny を選択することで、ごく基本的な機能を利用できます
```

### 大規模

利用シーン:

* バンドルサイズを気にしません。
* WebSocket と HTTP で通信します。
* CBOR による豊かなデータ表現が必要です。
* SurrealQL のデータ型の表現が必要です。
* バリデーションを行います。
* 全機能を持つクライアントを利用します。

```typescript
// 約 47 KB (minify + gzip)
import { initSurreal } from "@tai-kun/surrealdb";
import { httpEngine, webSocketEngine } from "@tai-kun/surrealdb/engines";
import { CborFormatter } from "@tai-kun/surrealdb/formatters";
import { ZodValidator } from "@tai-kun/surrealdb/validators";
import {
  Client,
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb/full";
```

## API リファレンス

[tai-kun.github.io/surrealdb-js](https://tai-kun.github.io/surrealdb-js/)

## テスト

### テストサイズ

* スモール: 純粋にその関数やクラスで完結するテスト
* ミディアム: テスト毎に SurrealDB を起動して、実際にデータベースを操作するテスト

### 何もスキップされていないテスト

* Node.js v20.x
* Node.js v22.x
* Bun
* Chrome

### 一部スキップされているテスト

* Node.js v18.x
    * ミディアムテストのみ必ずタイムアウトするためスキップされています。
* Deno
    * `AbortSignal.timeout()` がリソースリークするバグが修正されるまで、一部のスモールテストと全ミディアムテストがスキップします。Issue: [#20663](https://github.com/denoland/deno/issues/20663)
* Firefox
    * Selenium からスタックトレースをうまく取れないので、一部のエラー関連のテストがスキップされています。
