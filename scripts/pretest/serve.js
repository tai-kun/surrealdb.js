// @ts-nocheck

export {}; // TypeScript にこのファイルをモジュールと認識させる。

let port = 65535;
const procMap = new Map();

Bun.serve({
  hostname: "0.0.0.0",
  port: 3150,
  /**
   * @param {Request} req
   * @returns {Promise<Response>}
   */
  async fetch(req) {
    switch (req.method.toUpperCase()) {
      case "POST":
        switch (new URL(req.url).pathname) {
          case "/surrealdb/start": {
            const proc = Bun.spawn([
              "surreal",
              "start",
              ...["--bind", `0.0.0.0:${--port}`],
              ...["--user", "root"],
              ...["--pass", "root"],
              // ...["--strict"],
            ]);
            procMap.set(port, proc);

            return new Response(port.toString(10));
          }

          case "/stop": {
            const port = Number(await req.text());
            const proc = procMap.get(port);

            if (proc) {
              procMap.delete(port);
              proc.kill();
            }

            return new Response("OK");
          }

          default:
            return new Response(`Invalid url: ${req.url}`, {
              status: 400,
            });
        }

      default:
        return new Response(`Invalid method: ${req.method}`, {
          status: 400,
        });
    }
  },
});
