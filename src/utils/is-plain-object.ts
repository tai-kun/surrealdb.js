type PlainObj = { readonly [p: string]: unknown };

const getPrototypeOf = Object.getPrototypeOf;
const ObjectPrototype = Object.prototype;

export default function isPlainObject<T extends PlainObj>(o: unknown): o is T {
  if (typeof o !== "object" || o === null) {
    return false;
  }

  const prototype = getPrototypeOf(o);

  return (
    prototype === ObjectPrototype
    || prototype === null
  ) && !(Symbol.iterator in o);
}
