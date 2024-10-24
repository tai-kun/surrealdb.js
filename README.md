A modular SurrealDB client working in major JavaScript runtimes.

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/nodejs.yml?branch=main&logo=Node.js&label=Node.js)](https://github.com/tai-kun/surrealdb.js/actions/workflows/nodejs.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/bun.yml?branch=main&logo=Bun&label=Bun)](https://github.com/tai-kun/surrealdb.js/actions/workflows/bun.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/deno.yml?branch=main&logo=Deno&label=Deno)](https://github.com/tai-kun/surrealdb.js/actions/workflows/deno.yml)

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/chromium.yml?branch=main&logo=googlechrome&label=Chromium)](https://github.com/tai-kun/surrealdb.js/actions/workflows/chromium.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/firefox.yml?branch=main&logo=Firefox&label=Firefox)](https://github.com/tai-kun/surrealdb.js/actions/workflows/firefox.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/webkit.yml?branch=main&style=flat&logo=safari&label=WebKit)](https://github.com/tai-kun/surrealdb.js/actions/workflows/webkit.yml)

[![codecov](https://codecov.io/github/tai-kun/surrealdb.js/graph/badge.svg?token=T76SYSJZZV)](https://app.codecov.io/github/tai-kun/surrealdb.js)

[![License](https://img.shields.io/npm/l/%40tai-kun%2Fsurrealdb?style=flat&logo=apache&color=rgb(40%2C%2038%2C%2097))](https://opensource.org/licenses/Apache-2.0)

[![Latest Version](https://img.shields.io/npm/v/%40tai-kun%2Fsurrealdb?style=flat&logo=npm)](https://www.npmjs.com/package/@tai-kun/surrealdb)
<!-- ![Beta Version](https://img.shields.io/npm/v/%40tai-kun%2Fsurrealdb/beta?style=flat&logo=npm) -->

> [!NOTE]
> The main branch is currently under development for SurrealDB v2.
> You can find the repository for SurrealDB v1 [here](https://github.com/tai-kun/surrealdb.js/tree/v1).

## Document (JA/EN/KO/zh-CN)

[https://tai-kun.github.io/surrealdb.js/getting-started/](https://tai-kun.github.io/surrealdb.js/getting-started/)

## Install

```sh
npm i @tai-kun/surrealdb
```

## Quick Start

```ts
import { Surreal } from "@tai-kun/surrealdb";

const db = new Surreal();
await db.connect("<your_surrealdb_server>"); // e.g. ws://localhost:8000

try {
  await db.signin({ user: "root", pass: "root" });
  await db.use("sample_namespace", "sample_database");
  const results = await db.query<[number]>(/*surql*/ `RETURN 42;`);
  console.log(results); // [ 42 ]
} finally {
  await db.close();
}
```

## Customization

```ts
import { initSurreal } from "@tai-kun/surrealdb";
import Client from "@tai-kun/surrealdb/standard-client";
import HttpEngine from "@tai-kun/surrealdb/http-engine";
import JsonFormatter from "@tai-kun/surrealdb/json-formatter";

const { Surreal } = initSurreal({
  Client: Client,
  engines: {
    http: config => new HttpEngine({
      ...config,
      // fetch: <your custom fetch function>
    }),
    https: "http",
  },
  formatter: new JsonFormatter(),
});
```

## Requirements

SurrealDB v2

The repository for SurrealDB v1 is [here](https://github.com/tai-kun/surrealdb.js/tree/v1).

## Recommended environment

| Env | Version |
| --- | --- |
| Node.js  | `20.x`,`22.x` *1 |
| Deno     | `1.x`, `2.x` *2 |
| Bun      | `1.x` |
| Chromium | `>=104` *3 |
| Firefox  | `>=100` *4 |
| WebKit   | `>=15.4` *5 |

*1: Probably works with `18.x`  
*2: Probably works with `^1.44.3`  
*3: Probably works with `>=78`  
*4: Probably works with `>=68`  
*5: Probably works with `>=14`

## Fully Tested

| Env | Version |
| --- | --- |
| Node.js  | `20.x`,`22.x`,`23.x` |
| Deno     | `1.x`,`2.x` |
| Bun      | `1.x` |
| Chromium | `>=104` |

## Partial Tested

| Env | Version |
| --- | --- |
| Node.js  | `18.x` |
| Firefox  | `>=100` |
| WebKit   | `>=15.4` |

## License

[Apache-2.0](https://github.com/tai-kun/surrealdb.js/blob/main/LICENSE)
