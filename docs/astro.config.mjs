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
        "zh-CN": {
          label: "简体中文",
        },
        ko: {
          label: "한국어",
        },
      },
      sidebar: [
        // v2
        {
          label: "v2",
          items: [
            {
              label: "Start Here",
              translations: {
                ja: "入門",
                "zh-CN": "入门",
                ko: "시작하기",
              },
              items: [
                {
                  slug: "v2/getting-started",
                  label: "Getting Started",
                  translations: {
                    ja: "はじめる",
                    "zh-CN": "开始",
                    ko: "시작하기",
                  },
                },
                {
                  slug: "v2/supports",
                  label: "Supported Environments",
                  translations: {
                    ja: "サポートされている環境",
                    "zh-CN": "支持的环境",
                    ko: "지원되는 환경",
                  },
                },
                {
                  slug: "v2/about-doc",
                  label: "About This Document",
                  translations: {
                    ja: "このドキュメントについて",
                    "zh-CN": "关于此文档",
                    ko: "이 문서에 대해",
                  },
                },
              ],
            },
            {
              label: "Guides",
              translations: {
                ja: "ガイド",
                "zh-CN": "指南",
                ko: "가이드",
              },
              items: [
                {
                  slug: "v2/guides/connecting",
                  label: "Connecting",
                  translations: {
                    ja: "接続",
                    "zh-CN": "连接",
                    ko: "연결",
                  },
                },
                {
                  slug: "v2/guides/authentication",
                  label: "Authentication",
                  translations: {
                    ja: "認証",
                    "zh-CN": "认证",
                    ko: "인증",
                  },
                },
                {
                  slug: "v2/guides/querying",
                  label: "Querying",
                  translations: {
                    ja: "クエリー",
                    "zh-CN": "查询",
                    ko: "쿼리",
                  },
                },
                {
                  slug: "v2/guides/prepared-query",
                  label: "Prepared Query",
                  translations: {
                    ja: "事前に定義されたクエリー",
                    "zh-CN": "预定义查询",
                    ko: "사전 정의된 쿼리",
                  },
                },
              ],
            },
            {
              label: "Experimental",
              translations: {
                ja: "実験的",
                "zh-CN": "实验性",
                ko: "실험적",
              },
              items: [
                {
                  slug: "v2/experimental/inline-rpc",
                  label: "Inline RPC",
                  translations: {
                    ja: "インライン RPC",
                    "zh-CN": "内联 RPC",
                    ko: "인라인 RPC",
                  },
                },
                {
                  slug: "v2/experimental/inline-query",
                  label: "Inline Query",
                  translations: {
                    ja: "インラインクエリー",
                    "zh-CN": "内联查询",
                    ko: "인라인 쿼리",
                  },
                },
                {
                  slug: "v2/experimental/auto-reconnect",
                  label: "Auto Reconnect",
                  translations: {
                    ja: "自動再接続",
                    "zh-CN": "自动重连",
                    ko: "자동 재연결",
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
                    "zh-CN": "数据类型",
                    ko: "데이터 타입",
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
                        "zh-CN": "其他工具",
                        ko: "기타 도구",
                      },
                    },
                  ],
                },
                {
                  label: "Utilities",
                  translations: {
                    ja: "ユーティリティー",
                    "zh-CN": "实用工具",
                    ko: "유틸리티",
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
                },
                {
                  slug: "v2/api/errors",
                  label: "Errors",
                  translations: {
                    ja: "エラー",
                    "zh-CN": "错误",
                    ko: "오류",
                  },
                },
              ],
            },
          ],
        },
        // v1
        {
          label: "v1",
          items: [
            {
              label: "Start Here",
              translations: {
                ja: "入門",
                "zh-CN": "入门",
                ko: "시작하기",
              },
              items: [
                {
                  slug: "v1/getting-started",
                  label: "Getting Started",
                  translations: {
                    ja: "はじめる",
                    "zh-CN": "开始",
                    ko: "시작하기",
                  },
                },
                {
                  slug: "v1/supports",
                  label: "Supported Environments",
                  translations: {
                    ja: "サポートされている環境",
                    "zh-CN": "支持的环境",
                    ko: "지원되는 환경",
                  },
                },
              ],
            },
            {
              label: "Guides",
              translations: {
                ja: "ガイド",
                "zh-CN": "指南",
                ko: "가이드",
              },
              items: [
                {
                  slug: "v1/guides/connecting",
                  label: "Connecting",
                  translations: {
                    ja: "接続",
                    "zh-CN": "连接",
                    ko: "연결",
                  },
                },
                {
                  slug: "v1/guides/authentication",
                  label: "Authentication",
                  translations: {
                    ja: "認証",
                    "zh-CN": "认证",
                    ko: "인증",
                  },
                },
                {
                  slug: "v1/guides/querying",
                  label: "Querying",
                  translations: {
                    ja: "クエリー",
                    "zh-CN": "查询",
                    ko: "쿼리",
                  },
                },
                {
                  slug: "v1/guides/prepared-query",
                  label: "Prepared Query",
                  translations: {
                    ja: "事前に定義されたクエリー",
                    "zh-CN": "预定义查询",
                    ko: "사전 정의된 쿼리",
                  },
                },
              ],
            },
            {
              label: "Experimental",
              translations: {
                ja: "実験的",
                "zh-CN": "实验性",
                ko: "실험적",
              },
              items: [
                {
                  slug: "v1/experimental/inline-rpc",
                  label: "Inline RPC",
                  translations: {
                    ja: "インライン RPC",
                    "zh-CN": "内联 RPC",
                    ko: "인라인 RPC",
                  },
                },
                {
                  slug: "v1/experimental/inline-query",
                  label: "Inline Query",
                  translations: {
                    ja: "インラインクエリー",
                    "zh-CN": "内联查询",
                    ko: "인라인 쿼리",
                  },
                },
                {
                  slug: "v1/experimental/auto-reconnect",
                  label: "Auto Reconnect",
                  translations: {
                    ja: "自動再接続",
                    "zh-CN": "自动重连",
                    ko: "자동 재연결",
                  },
                },
              ],
            },
            {
              label: "Reference",
              translations: {
                ja: "参照",
                "zh-CN": "参考",
                ko: "참조",
              },
              items: [
                {
                  label: "CBOR",
                  items: [
                    {
                      slug: "v1/reference/cbor/encode",
                      label: "encode",
                    },
                    {
                      slug: "v1/reference/cbor/decode",
                      label: "decode",
                    },
                    {
                      slug: "v1/reference/cbor/tagged",
                      label: "Tagged",
                    },
                    {
                      slug: "v1/reference/cbor/simple",
                      label: "Simple",
                    },
                    {
                      slug: "v1/reference/cbor/others",
                      label: "Other tools",
                      translations: {
                        ja: "その他のツール",
                        "zh-CN": "其他工具",
                        ko: "기타 도구",
                      },
                    },
                  ],
                },
                {
                  label: "Utilities",
                  translations: {
                    ja: "ユーティリティー",
                    "zh-CN": "实用工具",
                    ko: "유틸리티",
                  },
                  items: [
                    {
                      slug: "v1/reference/utils/escape",
                      label: "escape",
                    },
                    {
                      slug: "v1/reference/utils/get-timeout-signal",
                      label: "getTimeoutSignal",
                    },
                    {
                      slug: "v1/reference/utils/is-array-buffer",
                      label: "isArrayBuffer",
                    },
                    {
                      slug: "v1/reference/utils/is-browser",
                      label: "isBrowser",
                    },
                    {
                      slug: "v1/reference/utils/is-safe-number",
                      label: "isSafeNumber",
                    },
                    {
                      slug: "v1/reference/utils/make-abort-api",
                      label: "makeAbortApi",
                    },
                    {
                      slug: "v1/reference/utils/mutex",
                      label: "mutex",
                    },
                    {
                      slug: "v1/reference/utils/serial",
                      label: "Serial",
                    },
                    {
                      slug: "v1/reference/utils/stateful-promise",
                      label: "StatefulPromise",
                    },
                    {
                      slug: "v1/reference/utils/task-queue",
                      label: "TaskQueue",
                    },
                    {
                      slug: "v1/reference/utils/task-emitter",
                      label: "TaskEmitter",
                    },
                    {
                      slug: "v1/reference/utils/throw-if-aborted",
                      label: "throwIfAborted",
                    },
                    {
                      slug: "v1/reference/utils/to-surql",
                      label: "toSurql",
                    },
                  ],
                },
                {
                  slug: "v1/reference/errors",
                  label: "Errors",
                  translations: {
                    ja: "エラー",
                    "zh-CN": "错误",
                    ko: "오류",
                  },
                },
              ],
            },
          ],
        },
      ],
      title: "surrealdb.js",
      social: {
        github: `https://github.com/${username}/${repository}`,
      },
      head: [
        {
          tag: "script",
          attrs: {
            src: `/${repository}/sidebar.js`,
          },
        },
      ],
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
