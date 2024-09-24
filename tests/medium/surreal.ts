import { type InitializedSurreal, initSurreal } from "@tai-kun/surrealdb";
import Client from "@tai-kun/surrealdb/clients/standard";
import * as dataTypes from "@tai-kun/surrealdb/data-types/standard";
import HttpEngine from "@tai-kun/surrealdb/engines/http";
import WebSocketEngine from "@tai-kun/surrealdb/engines/websocket";
import CborFormatter from "@tai-kun/surrealdb/formatters/cbor";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import { SemVer } from "semver";
import { afterAll, beforeAll, vi } from "vitest";
import { WebSocket } from "ws";

const engines = {
  http: HttpEngine,
  websocket: WebSocketEngine,
} as const;

const formatters = {
  cbor: CborFormatter,
  json: JsonFormatter,
} as const;

export default [
  define("http", "cbor"),
  define("http", "json"),
  define("websocket", "cbor"),
  define("websocket", "json"),
];

////////////////////////////////////////////////////////////////////////////////

type Engines = keyof typeof engines;
type Formatters = keyof typeof formatters;

function define(
  eng: Engines,
  fmt: Formatters,
): InitializedSurreal<typeof Client> & {
  eng: Engines;
  fmt: Formatters;
} & {
  suite: `${Engines}_${Formatters}`;
  url(): `${"http" | "ws"}://127.0.0.1:${number}`;
  ver: {
    (): SemVer;
    gt(major: number, minor?: number, patch?: number): boolean;
    ge(major: number, minor?: number, patch?: number): boolean;
    lt(major: number, minor?: number, patch?: number): boolean;
    le(major: number, minor?: number, patch?: number): boolean;
    eq(major: number, minor?: number, patch?: number): boolean;
    beta: {
      (): boolean;
      gt(version: number): boolean;
      ge(version: number): boolean;
      lt(version: number): boolean;
      le(version: number): boolean;
      eq(version: number): boolean;
    };
    alpha: {
      (): boolean;
      gt(version: number): boolean;
      ge(version: number): boolean;
      lt(version: number): boolean;
      le(version: number): boolean;
      eq(version: number): boolean;
    };
    nightly: {
      (): boolean;
      gt(year: number, month?: number, day?: number): boolean;
      ge(year: number, month?: number, day?: number): boolean;
      lt(year: number, month?: number, day?: number): boolean;
      le(year: number, month?: number, day?: number): boolean;
      eq(year: number, month?: number, day?: number): boolean;
    };
  };
} {
  let surreal: InitializedSurreal<typeof Client>;
  let formatter;

  switch (fmt) {
    case "cbor":
      formatter = new CborFormatter(dataTypes);
      break;

    case "json":
      formatter = new JsonFormatter();
      break;

    default:
      throw new Error(`unreachable: ${fmt}`);
  }

  switch (eng) {
    case "http":
      surreal = initSurreal({
        Client,
        engines: {
          http(config) {
            return new HttpEngine(config);
          },
        },
        formatter,
      });
      break;

    case "websocket":
      surreal = initSurreal({
        Client,
        engines: {
          ws(config) {
            return new WebSocketEngine({
              ...config,
              createWebSocket(addr, proto) {
                if ("WebSocket" in globalThis) {
                  return new globalThis.WebSocket(addr, proto);
                }

                return new WebSocket(addr, proto);
              },
            });
          },
        },
        formatter,
      });
      break;

    default:
      throw new Error(`unreachable: ${eng}`);
  }

  return {
    ...surreal,
    eng,
    fmt,
    suite: `${eng}_${fmt}`,
    url(): `${"http" | "ws"}://127.0.0.1:${number}` {
      return eng === "http"
        ? `http://${host()}`
        : `ws://${host()}`;
    },
    // dprint-ignore
    ver: Object.assign(() => v(), {
      gt: (a: number, b = 0, c = 0) => v().major >  a && v().minor >  b && v().patch >  c,
      ge: (a: number, b = 0, c = 0) => v().major >= a && v().minor >= b && v().patch >= c,
      lt: (a: number, b = 0, c = 0) => v().major <  a && v().minor <  b && v().patch <  c,
      le: (a: number, b = 0, c = 0) => v().major <= a && v().minor <= b && v().patch <= c,
      eq: (a: number, b = 0, c = 0) => v().major == a && v().minor == b && v().patch == c,
      beta: Object.assign(() => v().prerelease[0] === "beta", {
        gt: (ver: number, x?: any) => (x = v().prerelease)[0] === "beta" && typeof (x = x[1]) === "number" && x >  ver,
        ge: (ver: number, x?: any) => (x = v().prerelease)[0] === "beta" && typeof (x = x[1]) === "number" && x >= ver,
        lt: (ver: number, x?: any) => (x = v().prerelease)[0] === "beta" && typeof (x = x[1]) === "number" && x <  ver,
        le: (ver: number, x?: any) => (x = v().prerelease)[0] === "beta" && typeof (x = x[1]) === "number" && x <= ver,
        eq: (ver: number, x?: any) => (x = v().prerelease)[0] === "beta" && typeof (x = x[1]) === "number" && x == ver,
      }),
      alpha: Object.assign(() => v().prerelease[0] === "alpha", {
        gt: (ver: number, x?: any) => (x = v().prerelease)[0] === "alpha" && typeof (x = x[1]) === "number" && x >  ver,
        ge: (ver: number, x?: any) => (x = v().prerelease)[0] === "alpha" && typeof (x = x[1]) === "number" && x >= ver,
        lt: (ver: number, x?: any) => (x = v().prerelease)[0] === "alpha" && typeof (x = x[1]) === "number" && x <  ver,
        le: (ver: number, x?: any) => (x = v().prerelease)[0] === "alpha" && typeof (x = x[1]) === "number" && x <= ver,
        eq: (ver: number, x?: any) => (x = v().prerelease)[0] === "alpha" && typeof (x = x[1]) === "number" && x == ver,
      }),
      nightly: Object.assign(() => v().build.length > 0, {
        gt: (y: number, m = nowMonth(), d = nowDay(), x?: any) => (x = v().build).length > 0 && typeof (x = x[0]) === "string" && Number(x.slice(0, 4)) >  y && Number(x.slice(4, 6)) >  m && Number(x.slice(6)) >  d,
        ge: (y: number, m = nowMonth(), d = nowDay(), x?: any) => (x = v().build).length > 0 && typeof (x = x[0]) === "string" && Number(x.slice(0, 4)) >= y && Number(x.slice(4, 6)) >= m && Number(x.slice(6)) >= d,
        lt: (y: number, m = nowMonth(), d = nowDay(), x?: any) => (x = v().build).length > 0 && typeof (x = x[0]) === "string" && Number(x.slice(0, 4)) <  y && Number(x.slice(4, 6)) <  m && Number(x.slice(6)) <  d,
        le: (y: number, m = nowMonth(), d = nowDay(), x?: any) => (x = v().build).length > 0 && typeof (x = x[0]) === "string" && Number(x.slice(0, 4)) <= y && Number(x.slice(4, 6)) <= m && Number(x.slice(6)) <= d,
        eq: (y: number, m = nowMonth(), d = nowDay(), x?: any) => (x = v().build).length > 0 && typeof (x = x[0]) === "string" && Number(x.slice(0, 4)) == y && Number(x.slice(4, 6)) == m && Number(x.slice(6)) == d,
      })
    }),
  };
}

export function host(): `127.0.0.1:${number}` {
  if (typeof port !== "number") {
    throw new Error("テスト外でホストを取得できません。");
  }

  return `127.0.0.1:${port}`;
}

function v(): SemVer {
  if (!ver) {
    throw new Error("テスト外でバージョンを取得できません。");
  }

  return ver;
}

function nowMonth() {
  return new Date().getUTCMonth() + 1;
}

function nowDay() {
  return new Date().getUTCDay();
}

let port: number;
let ver: SemVer;

beforeAll(async () => {
  port = await vi.waitFor(
    async () => {
      const resp = await fetch("http://127.0.0.1:3150/surrealdb/start", {
        method: "POST",
      });

      if (!resp.ok) {
        await resp.body?.cancel();
        throw new Error(resp.statusText);
      }

      const text = await resp.text();

      return Number(text);
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
  await vi.waitFor(
    async () => {
      const resp = await fetch(`http://127.0.0.1:${port}/health`);
      await resp.body?.cancel();

      if (!resp.ok) {
        throw new Error(resp.statusText);
      }
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
  const resp = await fetch(`http://127.0.0.1:${port}/version`);
  const text = await resp.text();
  ver = new SemVer(text.substring("surrealdb-".length));
}, 30e3);

afterAll(async () => {
  try {
    const resp = await fetch("http://127.0.0.1:3150/stop", {
      method: "POST",
      body: String(port),
    });
    await resp.body?.cancel();
  } catch (e) {
    console.warn(e);
  }
});
