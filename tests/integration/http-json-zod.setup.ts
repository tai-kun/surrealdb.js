import {
  HttpEngine,
  JsonFormatter,
  Surreal,
  ZodValidator,
} from "@tai-kun/surrealdb/full";

Object.assign(globalThis, {
  IT: "[http-json-zod]",
  async connect(surrealdb: typeof SURREALDB) {
    await surrealdb.ready;
    const fmt = new JsonFormatter();
    const v8n = new ZodValidator();
    const db = new Surreal({
      engines: {
        http: args => new HttpEngine({ ...args, formatter: fmt }),
      },
      validator: v8n,
    });
    await db.connect(`http://${surrealdb.host}`);

    return Object.assign(db, {
      async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
        await db.disconnect();
      },
    });
  },
});
