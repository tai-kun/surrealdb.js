import {
  CborFormatter,
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Surreal,
  Table,
  Thing,
  Uuid,
  WebsocketEngine,
  ZodValidator,
} from "@tai-kun/surrealdb/full";

Object.assign(globalThis, {
  IT: "[ws-cbor-zod]",
  async connect(surrealdb: typeof SURREALDB) {
    await surrealdb.ready;
    const fmt = new CborFormatter({
      Datetime,
      Table,
      Thing,
      Uuid,
      Decimal,
      Duration,
      GeometryPoint,
      GeometryLine,
      GeometryPolygon,
      GeometryMultiPoint,
      GeometryMultiLine,
      GeometryMultiPolygon,
      GeometryCollection,
    });
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
