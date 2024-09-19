// @ts-check

import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import { glob } from "glob";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

const API_KEY = process.env["API_KEY"];

if (!API_KEY) {
  throw new Error("API_KEY not found");
}

const FROM_LANG = "ja";
const TO_LANG = "en";
const PROMPT = `
あなたは日本語と英語、JavaScript、TypeScriptの精通しているプログラマです。あなたにはこれから日本語で書かれたドキュメントを自然な英語にしてもらいます。
そのドキュメントには主に、TypeScriptコードで書かれたSurreaDBのSDKの使用方法に関する内容が、MDX形式で記されています。
ただし、次の指示に従って、<content>タグ内のドキュメントを自然な英語にしてください。

- 英語に翻訳した後も有効なMDX形式になるようにしてください。
- 公にするドキュメントとして適切な文体になるように配慮してください。
- 常に技術的なニュアンスを保ってください。
- ファイルパスやURLは絶対に変更しないでください。
- 最初に、<thinking>タグ内であなたに与えられた指示に対する解釈を述べてください。
- 次に、<output>タグ内にドキュメントを回答してください。

<content>
$1
</content>
`.trim();
// - 回答途中で誤りに気が付いた場合は<reflection>タグ内で修正点を列挙してください。
// - 誤りがある場合は<output>タグ内のドキュメントを修正したドキュメントを<fixed>タグ内に提供してください。

/**
 * @type {Record<string, string>}
 */
let cache = {};
const cacheDir = `cache/${FROM_LANG}2${TO_LANG}`;

try {
  await fs.access(cacheDir + "/meta.json");
  const json = await fs.readFile(cacheDir + "/meta.json", "utf-8");
  cache = JSON.parse(json);
} catch {}

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({
  model: "gemini-1.5-flash",
  // model: "gemini-1.5-pro",
});

const files = await glob(`src/content/docs/${FROM_LANG}/**/*.mdx`);

try {
  for (const file of files) {
    const progress = `[${
      (files.indexOf(file) + 1)
        .toString(10)
        .padStart(files.length.toString(10).length, "0")
    }/${files.length}] `;
    const distFile = file.replace(`/${FROM_LANG}/`, `/${TO_LANG}/`);
    const cacheFile = path.join(
      cacheDir + "/content",
      file.slice(file.indexOf(`/${FROM_LANG}/`) + `/${FROM_LANG}/`.length),
    );
    const content = await fs.readFile(file, "utf-8");
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    if (hash === cache[file]) {
      try {
        await fs.access(cacheFile);
        await fs.mkdir(path.dirname(distFile), { recursive: true });
        await fs.copyFile(cacheFile, distFile);
        console.log(progress + file + " ... SKIP");
        continue;
      } catch {}
    }

    console.log(progress + file);

    let result;

    while (true) {
      while (true) {
        try {
          result = await model.generateContent(PROMPT.replace("$1", content));
          break;
        } catch (e) {
          if (e instanceof GoogleGenerativeAIFetchError) {
            console.error(e.message);
          } else {
            console.error(e);
          }

          console.log(
            " ".repeat(progress.length) + "過剰リクエストに付き 3 分間待機",
          );
          await setTimeout(3 * 60e3);

          continue;
        }
      }

      const answer = result.response.text();
      const thinking = answer.match(/<thinking>([\s\S]*)<\/thinking>/);
      const output = answer.match(/<output>([\s\S]*)<\/output>/);

      if (!thinking || !output) {
        console.error("出力を得られませんでした。再試行します。");

        if (thinking) {
          console.debug("指示に対する Gemini の解釈:");
          console.debug(thinking[1].trim());
        }

        continue;
      }

      const text = output[1]
        .trim()
        .replace(new RegExp(`/${FROM_LANG}/`, "g"), `/${TO_LANG}/`)
        .replace(
          new RegExp(`/components/(?!${TO_LANG}/)`, "g"),
          `/components/${TO_LANG}/`,
        )
        + "\n";

      await fs.mkdir(path.dirname(distFile), { recursive: true });
      await fs.writeFile(distFile, text, "utf-8");

      await fs.mkdir(path.dirname(cacheFile), { recursive: true });
      await fs.writeFile(cacheFile, text, "utf-8");

      cache[file] = hash;

      break;
    }
  }
} finally {
  cache = Object.fromEntries(Object.keys(cache).sort().map(k => [k, cache[k]]));
  const json = JSON.stringify(cache, null, 2);
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cacheDir + "/meta.json", json, "utf-8");
}
