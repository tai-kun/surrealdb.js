import cp from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import * as tar from "tar";
import zip from "unzipper";

{
  const args = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
  });
  const [workflow, job] = args.positionals;

  if (!workflow || !job) {
    throw new Error("Usage: test.js <workflow> <job>");
  }

  const workflowPath = path.join(".github", "workflows", `${workflow}.yml`);

  if (!fs.existsSync(workflowPath)) {
    throw new Error(`Workflow not found: ${workflowPath}`);
  }

  const { act } = await prepare();
  cp.spawn(act, [
    act,
    ...["--workflows", workflowPath],
    ...["--job", job],
  ], {
    stdio: "inherit",
  });
}

/**
 * @returns {Promise<{ act: string }>}
 */
async function prepare() {
  const platform = process.platform === "win32"
    ? "Windows"
    : process.platform === "darwin"
    ? "Darwin"
    : process.platform === "linux"
    ? "Linux"
    : unreachable(new Error(`Unsupported platform: ${process.platform}`));
  const arch = process.arch === "x64"
    ? "x86_64"
    : process.arch === "arm64"
    ? "arm64"
    : unreachable(new Error(`Unsupported architecture: ${process.arch}`));
  const ext = platform === "Windows"
    ? "zip"
    : "tar.gz";

  const META_URL = "https://api.github.com/repos/nektos/act/releases/latest";
  const tagName = await fetch(META_URL)
    .then(resp => resp.json())
    .then(data => data.tag_name);
  const bin = path.join(
    ".cache",
    "act",
    tagName,
    platform === "Windows"
      ? "act.exe"
      : "act",
  );

  if (fs.existsSync(bin)) {
    return {
      act: bin,
    };
  }

  const binUrl =
    `https://github.com/nektos/act/releases/download/${tagName}/act_${platform}_${arch}.${ext}`;

  console.log("Downloading act from", binUrl);

  const resp = await fetch(binUrl);

  if (resp.status !== 200) {
    if (resp.body) {
      // @ts-expect-error: Nodejs 内で実行されるので、for-await-of が使える。
      for await (const _ of resp.body) {
        // force consumption of body
      }
    }

    throw new Error(`Failed to download act: ${resp.statusText}`);
  }

  if (!resp.body) {
    throw new Error("Got empty response body from act download");
  }

  const outPath = path.join(".cache", "act", tagName, `asset.${ext}`);
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });

  const outFile = await resp.arrayBuffer();
  await fs.promises.writeFile(outPath, Buffer.from(outFile));

  console.log("act downloaded to", outPath);

  if (ext === "zip") {
    const { promise, resolve, reject } = Promise.withResolvers();
    fs.createReadStream(outPath)
      .pipe(zip.Extract({ path: path.dirname(outPath) }))
      .on("close", resolve)
      .on("error", reject);
    await promise;
  } else {
    await tar.extract({
      file: outPath,
      cwd: path.dirname(outPath),
    });
  }

  if (fs.existsSync(bin)) {
    console.log("act extracted to", bin);

    return {
      act: bin,
    };
  }

  throw new Error(`Failed to extract act from ${outPath}, cannot find ${bin}`);
}

/**
 * @param {*} error
 * @returns {never}
 */
function unreachable(error) {
  throw error;
}
