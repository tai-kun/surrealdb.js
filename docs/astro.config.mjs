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
              slug: "getting-started",
              label: "Getting Started",
              translations: {
                ja: "はじめる",
              },
            },
            {
              slug: "supports",
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
              slug: "guides/connecting",
              label: "Connecting",
              translations: {
                ja: "接続",
              },
            },
            {
              slug: "guides/authentication",
              label: "Authentication",
              translations: {
                ja: "認証",
              },
            },
            {
              slug: "guides/querying",
              label: "Querying",
              translations: {
                ja: "クエリー",
              },
            },
            {
              slug: "guides/prepared-query",
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
              slug: "experimental/inline-rpc",
              label: "Inline RPC",
              translations: {
                ja: "インライン RPC",
              },
            },
            {
              slug: "experimental/inline-query",
              label: "Inline Query",
              translations: {
                ja: "インラインクエリー",
              },
            },
            {
              slug: "experimental/auto-reconnect",
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
                  slug: "reference/cbor/encode",
                  label: "encode",
                },
                {
                  slug: "reference/cbor/decode",
                  label: "decode",
                },
                {
                  slug: "reference/cbor/tagged",
                  label: "Tagged",
                },
                {
                  slug: "reference/cbor/simple",
                  label: "Simple",
                },
                {
                  slug: "reference/cbor/others",
                  label: "Other tools",
                  translations: {
                    ja: "その他のツール",
                  },
                },
              ],
            },
            {
              label: "utils",
              items: [
                {
                  slug: "reference/utils/escape",
                  label: "escape",
                },
                {
                  slug: "reference/utils/get-timeout-signal",
                  label: "getTimeoutSignal",
                },
                {
                  slug: "reference/utils/is-array-buffer",
                  label: "isArrayBuffer",
                },
                {
                  slug: "reference/utils/is-browser",
                  label: "isBrowser",
                },
                {
                  slug: "reference/utils/is-safe-number",
                  label: "isSafeNumber",
                },
                {
                  slug: "reference/utils/make-abort-api",
                  label: "makeAbortApi",
                },
                {
                  slug: "reference/utils/mutex",
                  label: "mutex",
                },
                {
                  slug: "reference/utils/serial",
                  label: "Serial",
                },
                {
                  slug: "reference/utils/stateful-promise",
                  label: "StatefulPromise",
                },
                {
                  slug: "reference/utils/task-queue",
                  label: "TaskQueue",
                },
                {
                  slug: "reference/utils/task-emitter",
                  label: "TaskEmitter",
                },
                {
                  slug: "reference/utils/throw-if-aborted",
                  label: "throwIfAborted",
                },
                {
                  slug: "reference/utils/to-surql",
                  label: "toSurql",
                },
              ],
            },
            {
              slug: "reference/errors",
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
