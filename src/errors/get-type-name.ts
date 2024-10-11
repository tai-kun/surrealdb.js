// 参考: https://github.com/twada/type-name/blob/master/index.js

const { toString } = Object.prototype;
const funcNameRegex = /^\s*function\s*([^\(\s]+)/i;

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getFuncName(func: Function): string {
  return (func.name || funcNameRegex.exec(func.toString())?.[1]) || "Function";
}

function getConstructorName(obj: object): string {
  const name = toString.call(obj).slice(8, -1);

  if (
    (name === "Object" || name === "Error")
    && typeof obj.constructor === "function"
  ) {
    return getFuncName(obj.constructor);
  }

  return name;
}

export type TypeName =
  | "null"
  | "undefined"
  | "Object"
  | "RegExp"
  | "URL"
  | "Date"
  | "Array"
  | "Map"
  | "Set"
  | "Promise"
  | "Function"
  | "GeneratorFunction"
  | "AsyncGeneratorFunction"
  | "BigInt"
  | "Boolean"
  | "Number"
  | "String"
  | "Symbol"
  | "Uint8Array"
  | "ArrayBuffer"
  | "Buffer"
  | (string & {});

export default function getTypeName(x: unknown): TypeName {
  return x == null
    ? String(x)
    : typeof x === "object"
    ? getConstructorName(x)
    : typeof x === "bigint"
    ? "BigInt"
    : typeof x === "function"
    ? getFuncName(x.constructor)
    : capitalize(typeof x);
}
