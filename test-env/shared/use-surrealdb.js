import { execSync, spawn } from "node:child_process";

const port = execSync(
  "flock /tmp/lock head -n 1 /tmp/ports && sed -i '1d' /tmp/ports",
  { encoding: "utf8" },
);
const portNumber = parseInt(port.trim(), 10);

if (portNumber < 49152 || 65535 < portNumber) {
  throw new Error(`Port number out of range: ${port}`);
}

spawn("surreal", [
  "start",
  ...["--bind", `0.0.0.0:${portNumber}`],
  ...["--username", "root"],
  ...["--password", "root"],
], {
  detached: true,
  stdio: "ignore",
}).unref();

async function waitForHealthOk() {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  for (;;) {
    try {
      const { status } = await fetch(`http://localhost:${portNumber}/health`);

      if (status === 200) {
        break;
      }
    } catch {}

    await sleep(100);
  }
}

Object.assign(globalThis, {
  SURREALDB: {
    ready: waitForHealthOk(),
    host: `localhost:${portNumber}`,
  },
});
