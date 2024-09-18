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
  switch (typeof x) {
    case "object":
      return x === null
        ? "null"
        : (x.constructor.name || "Object");

    case "function":
      return x.constructor.name || "Function";

    case "bigint":
      return "BigInt";

    case "boolean":
    case "number":
    case "string":
    case "symbol":
      return (typeof x).charAt(0).toUpperCase() + (typeof x).substring(1);

    default:
      return typeof x;
  }
}
