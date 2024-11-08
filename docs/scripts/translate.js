// @ts-check

import { GoogleGenerativeAI } from "@google/generative-ai";
import { glob } from "glob";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

export const CONTENT_START = "{/*CONTENT_START*/}";
export const CONTENT_END = "{/*CONTENT_END*/}";
export const CONTENT = "{/*CONTENT*/}";
export const THINKING_START = "{/*THINKING_START*/}";
export const THINKING_END = "{/*THINKING_END*/}";
export const OUTPUT_START = "{/*OUTPUT_START*/}";
export const OUTPUT_END = "{/*OUTPUT_END*/}";

/**
 * @param {{ apiKey: string | undefined; fromLang: string; toLang: string; prompt: string }} args
 */
export async function translate(args) {
  const {
    apiKey,
    fromLang,
    toLang,
    prompt,
  } = args;

  if (!apiKey) {
    throw new Error("apiKey not found");
  }

  /**
   * @type {Record<string, string>}
   */
  let cache = {};
  const cacheDir = `cache/${fromLang}2${toLang}`;

  try {
    await fs.access(cacheDir + "/meta.json");
    const json = await fs.readFile(cacheDir + "/meta.json", "utf-8");
    cache = JSON.parse(json);
  } catch {}

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    // model: "gemini-1.5-pro",
  });

  const files = await glob(`src/content/docs/${fromLang}/**/*.mdx`);

  try {
    for (const file of files) {
      const progress = `[${
        (files.indexOf(file) + 1)
          .toString(10)
          .padStart(files.length.toString(10).length, "0")
      }/${files.length}] `;
      const distFile = file.replace(`/${fromLang}/`, `/${toLang}/`);
      const cacheFile = path.join(
        cacheDir + "/content",
        file.slice(file.indexOf(`/${fromLang}/`) + `/${fromLang}/`.length),
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

      let answer;

      while (true) {
        while (true) {
          try {
            const { response } = await model.generateContent(
              prompt.replace(CONTENT, content),
            );
            answer = response.text();
            break;
          } catch (e) {
            if (e instanceof Error) {
              console.error(e.message);
            } else {
              console.error(e);
            }

            console.log(" ".repeat(progress.length) + "1 分間待機");
            await setTimeout(1 * 60e3);

            continue;
          }
        }

        const thinkingStart = answer.indexOf(THINKING_START);
        const thinkingEnd = answer.indexOf(THINKING_END, thinkingStart);
        const outputStart = answer.indexOf(OUTPUT_START, thinkingEnd);
        const outputEnd = answer.indexOf(OUTPUT_END, outputStart);

        if (
          [thinkingStart, thinkingEnd, outputStart, outputEnd]
            .some(i => i === -1)
          || answer
              .substring(thinkingStart + THINKING_START.length, thinkingEnd)
              .trim() === ""
          || answer
              .substring(outputStart + OUTPUT_START.length, outputEnd)
              .trim() === ""
        ) {
          console.error(
            "正しい形式の出力を得られませんでした。再試行します。",
            {
              thinking: [thinkingStart, thinkingEnd],
              output: [outputStart, outputEnd],
            },
          );
          continue;
        }

        if (
          answer
            .substring(thinkingStart + THINKING_START.length, thinkingEnd)
            .trim() === ""
        ) {
          console.error("thinking の内容がありません。再試行します。");
          continue;
        }

        if (
          (answer = answer
            .substring(outputStart + OUTPUT_START.length, outputEnd)
            .trim()) === ""
        ) {
          console.error("output の内容がありません。再試行します。");
          continue;
        }

        const text = answer
          .replace(new RegExp(`/${fromLang}/`, "g"), `/${toLang}/`)
          .replace(new RegExp(`slug: ${fromLang}/`, "g"), `slug: ${toLang}/`)
          .replace(
            new RegExp(`/components/(?!${toLang}/)`, "g"),
            `/components/${toLang}/`,
          )
          + "\n";

        await fs.mkdir(path.dirname(distFile), { recursive: true });
        await fs.writeFile(distFile, text, "utf-8");

        await fs.mkdir(path.dirname(cacheFile), { recursive: true });
        await fs.writeFile(cacheFile, text, "utf-8");

        cache[file] = hash;

        break;
      }

      break;
    }
  } finally {
    cache = Object.fromEntries(
      Object.keys(cache).sort().map(k => [k, cache[k]]),
    );
    const json = JSON.stringify(cache, null, 2);
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cacheDir + "/meta.json", json, "utf-8");
  }
}
