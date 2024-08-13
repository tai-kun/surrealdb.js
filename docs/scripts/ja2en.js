// @ts-check

import { GoogleGenerativeAI } from "@google/generative-ai";
import { glob } from "glob";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const API_KEY = process.env["API_KEY"];

if (!API_KEY) {
  throw new Error("API_KEY not found");
}

/**
 * @type {Record<string, string>}
 */
let cache = {};

try {
  await fs.access("cache/ja2en/meta.json");
  const json = await fs.readFile("cache/ja2en/meta.json", "utf-8");
  cache = JSON.parse(json);
} catch {}

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({
  // model: "gemini-1.5-flash",
  model: "gemini-1.5-pro",
});

const files = await glob("src/content/docs/ja/**/*.mdx");

try {
  for (const file of files) {
    const progress = `[${
      (files.indexOf(file) + 1)
        .toString(10)
        .padStart(files.length.toString(10).length, "0")
    }/${files.length}] `;
    const distFile = file.replace("/ja/", "/en/");
    const cacheFile = path.join(
      "cache/ja2en/content",
      file.slice(file.indexOf("/ja/") + 4),
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

    const result = await model.generateContent(
      [
        "あなたにはこれから日本語で書かれたドキュメントを自然な英語にしてもらいます。",
        "",
        "以下の指示に従ってください。",
        "- 日本語ドキュメントには主に、TypeScriptコードで書かれた、SurreaDBのクライアント"
        + "ライブラリの使用方法に関する内容が記されています。",
        "- 公にするドキュメントとして適切な文体になるように配慮してください。ただし、技術的なニュアンスを保ってください。",
        "- ファイルパスやURLに含まれる /ja/ をすべて /en/ に置換してください。",
        "",
        "それでは、以下の日本語で書かれた MDX 形式のドキュメントを自然な英語にして、その結果だけを"
        + "示してください。",
        "",
        content,
      ].join("\n"),
    );
    const text = result.response.text()
      .replace(/\/ja\//g, "/en/")
      .replace(/\/components\/(?!en\/)/g, "/components/en/");

    await fs.mkdir(path.dirname(distFile), { recursive: true });
    await fs.writeFile(distFile, text, "utf-8");

    await fs.mkdir(path.dirname(cacheFile), { recursive: true });
    await fs.writeFile(cacheFile, text, "utf-8");

    cache[file] = hash;
  }
} finally {
  const json = JSON.stringify(cache, null, 2);
  await fs.mkdir("cache/ja2en", { recursive: true });
  await fs.writeFile("cache/ja2en/meta.json", json, "utf-8");
}
