export default function isDataTypeOf<T = any>(o: unknown, id: string): o is T {
  return o !== null
    && typeof o === "object"
    // @ts-expect-error
    && o["$$datatype"] === Symbol.for("@tai-kun/surrealdb/data-types/" + id);
}
