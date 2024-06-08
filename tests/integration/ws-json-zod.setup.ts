import {
  JsonFormatter,
  Surreal,
  WebsocketEngine,
  ZodValidator,
} from "@tai-kun/surrealdb/full";

Object.assign(globalThis, {
  IT: "[ws-json-zod]",
  async connect(surrealdb: typeof SURREALDB) {
    await SURREALDB.ready;
    const fmt = new JsonFormatter();
    const v8n = new ZodValidator();
    const db = new Surreal({
      engines: {
        ws: args =>
          new WebsocketEngine({
            ...args,
            formatter: fmt,
            async createWebSocket(address, protocol) {
              switch (TEST_ENV) {
                case "Node":
                  // @ts-expect-error
                  return await import("undici")
                    .then(({ WebSocket }) => new WebSocket(address, protocol));

                case "CloudflareWorkers":
                  return await import("ws")
                    .then(({ WebSocket }) => new WebSocket(address, protocol));

                default:
                  // @ts-expect-error
                  return new WebSocket(address, protocol);
              }
            },
          }),
      },
      validator: v8n,
    });
    await db.connect(`ws://${surrealdb.host}`);

    return Object.assign(db, {
      async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
        await db.disconnect();
      },
    });
  },
});
