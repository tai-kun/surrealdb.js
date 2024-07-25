import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import remarkDefList, { defListHastHandlers } from "remark-definition-list";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "surreal.js",
      social: {
        github: "https://github.com/tai-kun/surreal.js",
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
        // {
        //   label: "Guides",
        //   translations: {
        //     ja: "ガイド"
        //   },
        //   items: [],
        // },
        {
          label: "Reference",
          translations: {
            ja: "リファレンス",
          },
          items: [
            // {
            //   slug: "reference/api-design",
            //   label: "API Design",
            //   translations: {
            //     ja: "API 設計",
            //   },
            // },
            // {
            //   label: "values",
            //   translations: {
            //     ja: "values",
            //   },
            //   items: [
            //     {
            //       slug: "reference/values/data-types",
            //       label: "Data Types",
            //       translations: {
            //         ja: "データ型",
            //       },
            //     },
            //   ],
            // },
            {
              label: "utils",
              items: [
                {
                  slug: "reference/utils/quote-str",
                  label: "quoteStr",
                },
                {
                  slug: "reference/utils/escape-key",
                  label: "escapeKey",
                },
                {
                  slug: "reference/utils/escape-rid",
                  label: "escapeRid",
                },
                {
                  slug: "reference/utils/escape-ident",
                  label: "escapeIdent",
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
                  slug: "reference/utils/stateful-promise",
                  label: "StatefulPromise",
                },
                {
                  slug: "reference/utils/throw-if-aborted",
                  label: "throwIfAborted",
                },
              ],
            },
            {
              label: "errors",
              items: [
                {
                  slug: "reference/errors/general",
                  label: "General Errors",
                  translations: {
                    ja: "一般的なエラー",
                  },
                },
              ],
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
  base: "/surreal.js",
});
