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

export interface ToPlainObject {
  readonly toPlainObject: () => Record<string, unknown>;
}

export interface Clone {
  readonly clone: () => any;
}

export function canToJSON(value: unknown): value is ToJSON {
  return typeof value === "object"
    && value !== null
    && "toJSON" in value
    && typeof value.toJSON === "function";
}

export function canToSurql(value: unknown): value is ToSurql {
  return typeof value === "object"
    && value !== null
    && "toSurql" in value
    && typeof value.toSurql === "function";
}

export function canToPlainObject(value: unknown): value is ToPlainObject {
  return typeof value === "object"
    && value !== null
    && "toPlainObject" in value
    && typeof value.toPlainObject === "function";
}

export function canClone(value: unknown): value is Clone {
  return typeof value === "object"
    && value !== null
    && "clone" in value
    && typeof value.clone === "function";
}
