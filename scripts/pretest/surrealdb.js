// @ts-nocheck

export {}; // TypeScript このファイルをモジュールとして認識させる。

let port = 65535;

Bun.serve({
  port: 3150,
  fetch() {
    Bun.spawn([
      "surreal",
      "start",
      ...["--bind", `0.0.0.0:${--port}`],
      ...["--username", "root"],
      ...["--password", "root"],
    ]).unref();

    return new Response(port.toString(10));
  },
});
