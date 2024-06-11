import { execSync, spawn } from "node:child_process";

export async function setup() {
  const portStr = execSync(
    // 利用可能なポート番号が列挙されているファイルからポート番号を取得する。
    // 競合しないように flock でロックを取ってからポート番号を取得し、
    // 取得したポート番号をファイルから削除する。
    "flock /tmp/lock head -n 1 /tmp/ports && sed -i '1d' /tmp/ports",
    { encoding: "utf8" },
  );
  const port = parseInt(portStr.trim(), 10);

  if (port < 49152 || 65535 < port) {
    throw new Error(`Port number out of range: ${portStr}`);
  }

  spawn("surreal", [
    "start",
    ...["--bind", `0.0.0.0:${port}`],
    ...["--username", "root"],
    ...["--password", "root"],
  ], {
    detached: true,
    stdio: "ignore",
  }).unref();

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  await sleep(100);
  let count = 0;

  for (;;) {
    try {
      const { status } = await fetch(`http://localhost:${port}/health`);

      if (status === 200) {
        break;
      }
    } catch (error) {
      // 約 20 秒
      if (++count === 200) {
        console.error("Failing to connect to SurrealDB", {
          port,
          error,
        });
      }
    }

    await sleep(100);
  }

  return {
    get host() {
      return `localhost:${port}`;
    },
    get hostname() {
      return "localhost";
    },
    get port() {
      return port;
    },
  };
}
