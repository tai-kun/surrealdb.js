import { ENV } from "@pkg/test";

let ready;

if (ENV === "Chrome" || ENV === "Firefox") {
  ready = Promise.resolve({
    get host() {
      return `${SURREALDB.hostname}:${SURREALDB.port}`;
    },
    get hostname() {
      return SURREALDB.hostname;
    },
    get port() {
      return SURREALDB.port;
    },
    _: "BROWSERIFY SHOULD INJECT SURREALDB GLOBALS",
  });
} else if (
  // ブラウザ向けのビルドでは、Node.js 向けのスクリプトを読み込まないようにする。
  process.env.BROWSERIFY !== "true"
) {
  ready = import("./setup.js").then(({ setup }) => setup());
}

export { ready };
