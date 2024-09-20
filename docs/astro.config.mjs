import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import remarkDefList, { defListHastHandlers } from "remark-definition-list";
import { visit } from "unist-util-visit";
import pkg from "../package.json";

const { username, repository } = getParams();

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
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
          label: "API",
          items: [
            {
              label: "Data Types",
              translations: {
                ja: "データ型",
              },
              items: [
                {
                  slug: "v2/api/data/thing",
                  label: "Thing",
                },
                {
                  slug: "v2/api/data/table",
                  label: "Table",
                },
                {
                  slug: "v2/api/data/uuid",
                  label: "Uuid",
                },
                {
                  slug: "v2/api/data/datetime",
                  label: "Datetime",
                },
                {
                  slug: "v2/api/data/duration",
                  label: "Duration",
                },
                {
                  slug: "v2/api/data/decimal",
                  label: "Decimal",
                },
                {
                  slug: "v2/api/data/future",
                  label: "Future",
                },
                {
                  slug: "v2/api/data/range",
                  label: "Range",
                },
                {
                  slug: "v2/api/data/bound-excluded",
                  label: "BoundExcluded",
                },
                {
                  slug: "v2/api/data/bound-included",
                  label: "BoundIncluded",
                },
                {
                  slug: "v2/api/data/geometry-point",
                  label: "GeometryPoint",
                },
                {
                  slug: "v2/api/data/geometry-line",
                  label: "GeometryLine",
                },
                {
                  slug: "v2/api/data/geometry-polygon",
                  label: "GeometryPolygon",
                },
                {
                  slug: "v2/api/data/geometry-multi-point",
                  label: "GeometryMultiPoint",
                },
                {
                  slug: "v2/api/data/geometry-multi-line",
                  label: "GeometryMultiLine",
                },
                {
                  slug: "v2/api/data/geometry-multi-polygon",
                  label: "GeometryMultiPolygon",
                },
                {
                  slug: "v2/api/data/geometry-collection",
                  label: "GeometryCollection",
                },
              ],
            },
            {
              label: "CBOR",
              items: [
                {
                  slug: "v2/api/cbor/encode",
                  label: "encode",
                },
                {
                  slug: "v2/api/cbor/decode",
                  label: "decode",
                },
                {
                  slug: "v2/api/cbor/tagged",
                  label: "Tagged",
                },
                {
                  slug: "v2/api/cbor/simple",
                  label: "Simple",
                },
                {
                  slug: "v2/api/cbor/others",
                  label: "Other tools",
                  translations: {
                    ja: "その他のツール",
                  },
                },
              ],
              collapsed: false,
            },
            {
              label: "utilities",
              translations: {
                ja: "ユーティリティー",
              },
              items: [
                {
                  slug: "v2/api/utils/escape",
                  label: "escape",
                },
                {
                  slug: "v2/api/utils/get-timeout-signal",
                  label: "getTimeoutSignal",
                },
                {
                  slug: "v2/api/utils/is-array-buffer",
                  label: "isArrayBuffer",
                },
                {
                  slug: "v2/api/utils/is-browser",
                  label: "isBrowser",
                },
                {
                  slug: "v2/api/utils/is-safe-number",
                  label: "isSafeNumber",
                },
                {
                  slug: "v2/api/utils/make-abort-api",
                  label: "makeAbortApi",
                },
                {
                  slug: "v2/api/utils/mutex",
                  label: "mutex",
                },
                {
                  slug: "v2/api/utils/serial",
                  label: "Serial",
                },
                {
                  slug: "v2/api/utils/stateful-promise",
                  label: "StatefulPromise",
                },
                {
                  slug: "v2/api/utils/task-queue",
                  label: "TaskQueue",
                },
                {
                  slug: "v2/api/utils/task-emitter",
                  label: "TaskEmitter",
                },
                {
                  slug: "v2/api/utils/throw-if-aborted",
                  label: "throwIfAborted",
                },
                {
                  slug: "v2/api/utils/to-surql",
                  label: "toSurql",
                },
              ],
              collapsed: false,
            },
            {
              slug: "v2/api/errors",
              label: "Errors",
              translations: {
                ja: "エラー",
              },
            },
          ],
        },
      ],
      title: "surrealdb.js",
      social: {
        github: `https://github.com/${username}/${repository}`,
      },
    }),
  ],
  site: `https://${username}.github.io`,
  base: "/" + repository,
  markdown: {
    remarkPlugins: [
      remarkDefList,
      function remarkAddPrefixToLinks() {
        return tree => {
          visit(tree, "link", node => {
            if (/^\/v\d+\//.test(node.url)) {
              node.url = "/" + repository + node.url;
            }
          });
        };
      },
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
});

function getParams() {
  const { hostname, pathname } = new URL(pkg.repository.url);
  const [_, username, repository] = pathname.split("/");

  if (hostname !== "github.com") {
    throw new Error(`"${hostname}" must to be github.com`);
  }

  if (!username) {
    throw new Error("username not found");
  }

  if (!repository) {
    throw new Error("repository not found");
  }

  return {
    username,
    repository,
  };
}
