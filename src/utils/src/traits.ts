export type JsonPrimitive = string | number | boolean | null;

export type JsonifiableObject =
  | { [_ in string]?: Jsonifiable }
  | ToJSON;

export type JsonifiableArray = Jsonifiable[];

export type Jsonifiable =
  | JsonPrimitive
  | JsonifiableObject
  | JsonifiableArray;

export interface ToJSON {
  readonly toJSON: () => Jsonifiable;
}

export interface ToSurql {
  readonly toSurql: () => string;
}

export interface ToPlain {
  readonly toPlain: () => Record<string, unknown>;
}

export interface Clone {
  readonly clone: () => any;
}

export function hasToJSON(value: object): value is ToJSON {
  return "toJSON" in value && typeof value.toJSON === "function";
}

export function hasToSurql(value: object): value is ToSurql {
  return "toSurql" in value && typeof value.toSurql === "function";
}

export function hasToPlain(value: object): value is ToPlain {
  return "toPlain" in value && typeof value.toPlain === "function";
}

export function hasClone(value: object): value is Clone {
  return "clone" in value && typeof value.clone === "function";
}
