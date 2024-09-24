type PlainObj = { readonly [p: string]: unknown };

const getPrototypeOf = Object.getPrototypeOf;
const ObjectPrototype = Object.prototype;
const ObjectConstructor = Object;

export default function isPlainObject<T extends PlainObj>(o: unknown): o is T {
  if (typeof o !== "object" || o === null) {
    return false;
  }

  let tmp;

  return ((tmp = getPrototypeOf(o)) === ObjectPrototype || tmp === null)
    && ((tmp = o["constructor"]) === ObjectConstructor || tmp === undefined)
    && !(Symbol.iterator in o);
}
