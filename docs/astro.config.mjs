import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import remarkDefList, { defListHastHandlers } from "remark-definition-list";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "surrealdb.js",
      social: {
        github: "https://github.com/tai-kun/surrealdb.js",
      },
      defaultLocale: "ja",
      locales: {
        en: {
          label: "English",
        },
        ja: {
          label: "日本語",
        },
      },
      sidebar: [
        {
          label: "Start Here",
          translations: {
            ja: "入門",
          },
          items: [
            {
              slug: "v2/getting-started",
              label: "Getting Started",
              translations: {
                ja: "はじめる",
              },
            },
            {
              slug: "v2/supports",
              label: "Supported Environments",
              translations: {
                ja: "サポートされている環境",
              },
            },
          ],
        },
        {
          label: "Guides",
          translations: {
            ja: "ガイド",
          },
          items: [
            {
              slug: "v2/guides/connecting",
              label: "Connecting",
              translations: {
                ja: "接続",
              },
            },
            {
              slug: "v2/guides/authentication",
              label: "Authentication",
              translations: {
                ja: "認証",
              },
            },
            {
              slug: "v2/guides/querying",
              label: "Querying",
              translations: {
                ja: "クエリー",
              },
            },
            {
              slug: "v2/guides/prepared-query",
              label: "Prepared Query",
              translations: {
                ja: "事前に定義されたクエリー",
              },
            },
          ],
        },
        {
          label: "Experimental",
          translations: {
            ja: "実験的",
          },
          items: [
            {
              slug: "v2/experimental/inline-rpc",
              label: "Inline RPC",
              translations: {
                ja: "インライン RPC",
              },
            },
            {
              slug: "v2/experimental/inline-query",
              label: "Inline Query",
              translations: {
                ja: "インラインクエリー",
              },
            },
            {
              slug: "v2/experimental/auto-reconnect",
              label: "Auto Reconnect",
              translations: {
                ja: "自動再接続",
              },
            },
          ],
        },
        {
          label: "Reference",
          translations: {
            ja: "リファレンス",
          },
          items: [
            {
              label: "cbor",
              items: [
                {
                  slug: "v2/reference/cbor/encode",
                  label: "encode",
                },
                {
                  slug: "v2/reference/cbor/decode",
                  label: "decode",
                },
                {
                  slug: "v2/reference/cbor/tagged",
                  label: "Tagged",
                },
                {
                  slug: "v2/reference/cbor/simple",
                  label: "Simple",
                },
                {
                  slug: "v2/reference/cbor/others",
                  label: "Other tools",
                  translations: {
                    ja: "その他のツール",
                  },
                },
              ],
              collapsed: false,
            },
            {
              label: "utils",
              items: [
                {
                  slug: "v2/reference/utils/escape",
                  label: "escape",
                },
                {
                  slug: "v2/reference/utils/get-timeout-signal",
                  label: "getTimeoutSignal",
                },
                {
                  slug: "v2/reference/utils/is-array-buffer",
                  label: "isArrayBuffer",
                },
                {
                  slug: "v2/reference/utils/is-browser",
                  label: "isBrowser",
                },
                {
                  slug: "v2/reference/utils/is-safe-number",
                  label: "isSafeNumber",
                },
                {
                  slug: "v2/reference/utils/make-abort-api",
                  label: "makeAbortApi",
                },
                {
                  slug: "v2/reference/utils/mutex",
                  label: "mutex",
                },
                {
                  slug: "v2/reference/utils/serial",
                  label: "Serial",
                },
                {
                  slug: "v2/reference/utils/stateful-promise",
                  label: "StatefulPromise",
                },
                {
                  slug: "v2/reference/utils/task-queue",
                  label: "TaskQueue",
                },
                {
                  slug: "v2/reference/utils/task-emitter",
                  label: "TaskEmitter",
                },
                {
                  slug: "v2/reference/utils/throw-if-aborted",
                  label: "throwIfAborted",
                },
                {
                  slug: "v2/reference/utils/to-surql",
                  label: "toSurql",
                },
              ],
              collapsed: false,
            },
            {
              slug: "v2/reference/errors",
              label: "Errors",
              translations: {
                ja: "エラー",
              },
            },
          ],
        },
      ],
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkDefList,
    ],
    remarkRehype: {
      handlers: {
        ...defListHastHandlers,
      },
    },
  },
  prefetch: {
    prefetchAll: true,
  },
  site: "https://tai-kun.github.io",
  base: "/surrealdb.js",
});
