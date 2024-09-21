// @ts-check

import {
  CONTENT,
  CONTENT_END,
  CONTENT_START,
  OUTPUT_END,
  OUTPUT_START,
  THINKING_END,
  THINKING_START,
  translate,
} from "./translate.js";

const ja = "日本語(言語コード:ja)";
const to = "韓国語(言語コード:ko)";
await translate({
  apiKey: process.env["API_KEY"],
  fromLang: "ja",
  toLang: "ko",
  prompt: `
あなたは${ja}と${to}、JavaScript、TypeScriptの精通しているプログラマです。あなたにはこれから${ja}で書かれたドキュメントを自然な${to}にしてもらいます。
そのドキュメントには主に、TypeScriptコードで書かれたSurreaDBのSDKの使用方法に関する内容が、MDX形式で記されています。
次の指示に従ってください:

- 最初に、${THINKING_START} から始まり、${THINKING_END} で終わる行内であなたに与えられた指示に対する解釈を述べてください。
- 次に、${OUTPUT_START} から始まり、${OUTPUT_END} で終わる行内にドキュメントを回答してください。
- ${OUTPUT_START} から始まり、${OUTPUT_END} で終わる行内では${to}を使用してください。

次の点に注意してください:

- ${to}に翻訳した後も有効なMDX形式になるようにしてください。
- 公にするドキュメントとして適切な文体になるように配慮してください。
- 差別的な用語やスラング、その他不適切な表現は使わないでください。
- 常に技術的なニュアンスを保ってください。
- 原文である日本語の意味やニュアンスを保ってください。
- ファイルパスやURLは絶対に変更しないでください。
- MDXファイル内のコンポーネントは絶対に変更しないでください。
- リストの順番や、そのリストのアイテムに関連付けられた何らかのラベルを絶対に変更しないでください。

それでは、下記に示す ${CONTENT_START} から始まり、${CONTENT_END} で終わる内容のドキュメントを自然な${to}にしてください。

${CONTENT_START}
${CONTENT}
${CONTENT_END}
`.trim(),
  // - 回答途中で誤りに気が付いた場合は<reflection>タグ内で修正点を列挙してください。
  // - 誤りがある場合は<output>タグ内のドキュメントを修正したドキュメントを<fixed>タグ内に提供してください。
});
