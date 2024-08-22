[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/nodejs.yml?branch=v1&logo=Node.js&label=Node.js)](https://github.com/tai-kun/surrealdb.js/actions/workflows/nodejs.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/bun.yml?branch=v1&logo=Bun&label=Bun)](https://github.com/tai-kun/surrealdb.js/actions/workflows/bun.yml)
<!-- [![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/deno.yml?branch=v1&logo=Deno&label=Deno)](https://github.com/tai-kun/surrealdb.js/actions/workflows/deno.yml) -->

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/chromium.yml?branch=v1&logo=googlechrome&label=Chromium)](https://github.com/tai-kun/surrealdb.js/actions/workflows/chromium.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/firefox.yml?branch=v1&logo=Firefox&label=Firefox)](https://github.com/tai-kun/surrealdb.js/actions/workflows/firefox.yml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tai-kun/surrealdb.js/webkit.yml?branch=v1&style=flat&logo=safari&label=WebKit)](https://github.com/tai-kun/surrealdb.js/actions/workflows/webkit.yml)

[![codecov](https://codecov.io/github/tai-kun/surrealdb.js/graph/badge.svg?token=T76SYSJZZV)](https://app.codecov.io/github/tai-kun/surrealdb.js)

[![License](https://img.shields.io/npm/l/%40tai-kun%2Fsurrealdb?style=flat&logo=apache&color=rgb(40%2C%2038%2C%2097))](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/npm/v/%40tai-kun%2Fsurrealdb?style=flat&logo=npm)](https://www.npmjs.com/package/@tai-kun/surrealdb)

## Document

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

await db.signin({ user: "root", pass: "root" });

const results = await db.query<[number]>(/*surql*/ `RETURN 42;`);
console.log(results); // [ 42 ]

await db.disconnect();
```

## Customization

```ts
import { initSurreal } from "@tai-kun/surrealdb";
import Client from "@tai-kun/surrealdb/clients/standard";
import HttpEngine from "@tai-kun/surrealdb/engines/http";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import NoOpValidator from "@tai-kun/surrealdb/validators/noop";

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
  validator: new NoOpValidator(),
});
```

## Requirements

SurrealDB >=1.5.0

## Recommended environment

| Env | Version |
| --- | --- |
| Node.js | `20.x`,`^22.5.1` *1 |
| Deno | `^1.44.3` (not tested) |
| Bun | `^1.1.13` |
| Chromium | `>=104` *2 |
| Firefox | `>=100` *3 |
| WebKit | `>=15.4` *4 |

*1: Probably works with `18.x`  
*2: Probably works with `>=78`  
*3: Probably works with `>=68`  
*4: Probably works with `>=14`

and:

Do not expect sub-millisecond precision for dates prior to the UNIX epoch.

## TODO

- [x] Implement basic features
- [x] Add functionality to improve query handling
- [ ] Add connection pooling
- [ ] Add tests
- [ ] Improve documentation
- [ ] Add benchmarks

## License

[Apache-2.0](https://github.com/tai-kun/surrealdb.js/blob/main/LICENSE)
