import {
  HttpEngine,
  JsonFormatter,
  Surreal,
  ZodValidator,
} from "@tai-kun/surrealdb/full";

Object.assign(globalThis, {
  IT: "[http-json-zod]",
  async connect(host: typeof SURREALDB_HOST) {
    if (!host) {
      throw new Error("SURREALDB_HOST is not defined");
    }

    const fmt = new JsonFormatter();
    const v8n = new ZodValidator();
    const db = new Surreal({
      engines: {
        http: args => new HttpEngine({ ...args, formatter: fmt }),
      },
      validator: v8n,
    });
    await db.connect(`http://${host}`);

    return Object.assign(db, {
      async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
        await db.disconnect();
      },
    });
  },
});
