[GitHub](https://github.com/tai-kun/surrealdb-js)
[NPM] (https://www.npmjs.com/package/@tai-kun/surrealdb)
[Official SDK](https://github.com/surrealdb/surrealdb.js)

[![CI](https://github.com/tai-kun/surrealdb-js/actions/workflows/ci.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/ci.yml)
[![Canary Release on NPM](https://github.com/tai-kun/surrealdb-js/actions/workflows/canary-release.yml/badge.svg)](https://github.com/tai-kun/surrealdb-js/actions/workflows/canary-release.yml)

## Introduction

This SDK is based on the official SDK, and the basic API is very similar.

The purposes of this repository are as follows:

- To deepen my understanding of the SurrealDB RPC protocol.
- To explore the concept of a modular SDK.

## Note

- There is no stable version of this package.
  All releases are canary releases.
- Breaking changes will be made without notice.
- Testing is insufficient. It feels like only about 20% is covered.

## Installation

```bash
npm i @tai-kun/surrealdb@canary
bun i @tai-kun/surrealdb@canary
pnpm i @tai-kun/surrealdb@canary
yarn add @tai-kun/surrealdb@canary
# deno add @tai-kun/surrealdb ?
```

## Usage

This SDK is composed of four components:

1. Client
    - `Surreal`: A class that integrates the following three components.
2. Engine
    - `HttpEngine`:
      Communicates via HTTP.
      It replicates operations that are limited to bi-directional communication as much as possible.
    - `WebsocketEngine`: Communicates via WebSocket.
3. Formatter
    - `JsonFormatter`:
      Encodes and decodes data in JSON format.
      This results in a smaller bundle size but limits the expressiveness of the data.
    - `CborFormatter`:
      Encodes and decodes data in CBOR format.
      This results in a larger bundle size but offers richer data expressiveness.
4. Validator
    - `EmptyValidator`:
      Does not perform data validation.
      This results in a smaller bundle size but lowers data reliability.
    - `ZodValidator`:
      Performs data validation.
      This results in a larger bundle size but increases data reliability.

<details>
<summary>HTTP + JSON</summary>

```typescript
import {
  // Client
  Surreal,

  // Engine
  HttpEngine,

  // Formatter
  JsonFormatter,

  // Validator
  EmptyValidator,
} from "@tai-kun/surrealdb";

const fmt = new JsonFormatter();
const v8n = new EmptyValidator();
const db = new Surreal({
  engines: {
    http: args => new HttpEngine({ ...args, formatter: fmt }),
    https: "http",
  },
  validator: v8n,
});
```
</details>

<details>
<summary>HTTP + CBOR + Zod</summary>

```typescript
import {
  // Client
  Surreal,

  // Engine
  HttpEngine,

  // Formatter
  CborFormatter,

  // Values
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

  // Validator
  ZodValidator,
} from "@tai-kun/surrealdb";

const fmt = new CborFormatter({
  Datetime,
  Table,
  Thing,
  Uuid,
  Decimal,
  Duration,
  GeometryPoint,
  GeometryLine,
  GeometryPolygon,
  GeometryMultiPoint,
  GeometryMultiLine,
  GeometryMultiPolygon,
  GeometryCollection,
});
const v8n = new ZodValidator();
const db = new Surreal({
  engines: {
    http: args => new HttpEngine({ ...args, formatter: fmt }),
    https: "http",
  },
  validator: v8n,
});
```
</details>

<details>
<summary>WebSocket</summary>

```typescript
import {
  // Client
  Surreal,

  // Engine
  WebsocketEngine,

  // Formatter
  JsonFormatter,

  // Validator
  EmptyValidator,
} from "@tai-kun/surrealdb";

const fmt = new JsonFormatter();
const v8n = new EmptyValidator();
const db = new Surreal({
  engines: {
    ws: args =>
      new WebsocketEngine({
        ...args,
        formatter: fmt,
        async createWebSocket(address, protocol) {
          return "process" in globalThis
            // Node.js
            ? await import("ws") // or `await import ("undici")`
                .then(({ WebSocket }) => new WebSocket(address, protocol));
            // Bun, Deno or Browser
            : new WebSocket(address, protocol);
        },
      }),
    wss: "ws",
  },
  validator: v8n,
});
```
</details>

## Supported Runtimes

| Runtime | HTTP | WebSocket | Version |
| ------- | :--: | :-------: | ------- |
| Node.js               | ✅ | ✅ | `22.x`, `20.x`, `18.x` |
| Deno \*               | ? | ? | `>=1.40` |
| Bun \*                | ? | ? | ? |
| Chrome                | ✅ | ✅ | `>=103` |
| Firefox \*            | ❌ | ❌ | ? |
| Cloudflare Workers \* | ? | ? | ? |

- \*: Not tested.
- It is assumed to work with Deno, Bun, and Cloudflare Workers, but this has not been tested.
- Firefox seems unable to retrieve the fetch response body as an ArrayBuffer.
- Do not use the experimental WebSocket introduced in Node.js 22.
  Instead, use `ws`, or ensure that the version of `undici` you are using in Node.js is at least `6.18`.

## Modular SDK

As shown in the "Usage" section, this SDK is composed of four components: Client, Engine, Formatter, and Validator.
Additionally, the Client and Formatter components have two variants besides the standard version:

- `@tai-kun/surrealdb`: Standard usage
- `@tai-kun/surrealdb/tiny`: Smaller bundle size with limited functionality and expressiveness
- `@tai-kun/surrealdb/full`: Rich functionality and expressiveness with a larger bundle size

For example, you can reduce the bundle size in the following scenarios:

- RPC over HTTP
- I only need the minimal `ping` and `rpc` methods on the client.
- No value validation is required.
- JSON data representation is sufficient.
- I want to minimize the bundle size as much as possible.

```typescript
// 5.35 kB (minified + gzipped)
import {
  Surreal,
  HttpEngine,
  JsonFormatter,
  EmptyValidator,
} from "@tai-kun/surrealdb/tiny";
```

Conversely, the bundle size will be larger in the following scenarios:

- RPC over WebSocket
- I want to use various methods such as `live`, `query`, `select`, and `create` on the client.
- I want to perform value validation with Zod.
- I want to handle complex data using CBOR.
- I do not care about the bundle size.

```typescript
// 42.04 kB (minified + gzipped)
import {
  Surreal,
  WebsocketEngine,
  CborFormatter,
  ZodValidator,

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

For a middle-ground approach, the bundle size will be moderate in the following scenarios:

- RPC over WebSocket
- I want to use `live` and `query` methods on the client, in addition to `ping` and `rpc`.
- No value validation, as thorough testing is performed.
- I am concerned about bundle size but still need a minimum level of functionality and expressiveness.

```typescript
// 13.01 kB (minified + gzipped)
import {
  Surreal,
  WebsocketEngine,
  CborFormatter,
  EmptyValidator,
} from "@tai-kun/surrealdb";
import {
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
} from "@tai-kun/surrealdb/tiny";
```

## API Reference

[https://tai-kun.github.io/surrealdb-js/](https://tai-kun.github.io/surrealdb-js/)

## TODO

- Improve test coverage.
- Test on Deno, Bun, Firefox, and Safari.
- Lower the minimum supported browser versions as much as possible.

## Ideas to Try

### Represent CBOR with Superjson

SurrealDB can directly connect the browser to the database.
However, implementing a Web UI often involves using frameworks like Next.js.
These frameworks and their surrounding toolchains have effectively standardized JSON formats.
If we can convert CBOR binary data, or its decoded values, into [Superjson](https://github.com/blitz-js/superjson) on the server-side and restore it on the client-side, it would significantly broaden the potential use cases of this SDK.
