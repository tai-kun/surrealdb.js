import { exec, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

async function getPort() {
  let port;

  if ("Deno" in globalThis) {
    const command = new Deno.Command("bash", {
      args: [
        "-c",
        "flock /tmp/lock head -n 1 /tmp/ports && sed -i '1d' /tmp/ports",
      ],
    });
    const { stdout } = await command.output();
    const string = new TextDecoder().decode(stdout);
    port = parseInt(string.trim(), 10);
  } else {
    const { stdout } = await promisify(exec)(
      // 利用可能なポート番号が列挙されているファイルからポート番号を取得する。
      // 競合しないように flock でロックを取ってからポート番号を取得し、
      // 取得したポート番号をファイルから削除する。
      "flock /tmp/lock head -n 1 /tmp/ports && sed -i '1d' /tmp/ports",
      { encoding: "utf8" },
    );
    port = parseInt(stdout.trim(), 10);
  }

  if (port < 49152 || 65535 < port) {
    throw new Error(`Port number out of range: ${stdout}`);
  }

  return port;
}

async function spawnSurreal(port) {
  if ("Deno" in globalThis) {
    // TODO(tai-kun): バックグラウンドで実行する方法を調査する。
    // const { afterAll } = await import("jsr:@std/testing/bdd");
    // const command = new Deno.Command("surreal", {
    //   args: [
    //     "start",
    //     ...["--bind", `0.0.0.0:${port}`],
    //     ...["--username", "root"],
    //     ...["--password", "root"],
    //   ],
    // });
    // const cp = command.spawn();
    // afterAll(async () => {
    //   cp.kill();
    //   await cp.status;
    // });
  } else {
    spawn("surreal", [
      "start",
      ...["--bind", `0.0.0.0:${port}`],
      ...["--username", "root"],
      ...["--password", "root"],
    ], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }
}

export async function setup() {
  if (!existsSync("/tmp/lock")) {
    return null;
  }

  const port = await getPort();
  await spawnSurreal(port);

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  await sleep(100);
  let count = 0;

  for (;;) {
    try {
      const resp = await fetch(`http://localhost:${port}/health`);
      await resp.body.cancel();

      if (resp.status === 200) {
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
