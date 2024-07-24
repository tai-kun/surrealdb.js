// @ts-ignore
declare module globalThis {
  interface ArrayConstructor {
    isArray(arg: readonly any[] | any): arg is readonly any[];
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    BROWSER: `${1 | 0}`;
    RUNTIME:
      | "node.js"
      // | "deno"
      | "bun"
      | "chromium"
      | "firefox"
      | "webkit";
  }
}
