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
  HttpEngine,
  Surreal,
  Table,
  Thing,
  Uuid,
  ZodValidator,
} from "@tai-kun/surrealdb/full";

Object.assign(globalThis, {
  IT: "[http-cbor-zod]",
  async connect(host: typeof SURREALDB_HOST) {
    if (!host) {
      throw new Error("SURREALDB_HOST is not defined");
    }

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
