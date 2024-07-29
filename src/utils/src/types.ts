export type JsonPrimitive = string | number | boolean | null;

export type JsonifiableObject =
  | { [_ in string]?: Jsonifiable }
  | { toJSON: () => Jsonifiable };

export type JsonifiableArray = Jsonifiable[];

export type Jsonifiable =
  | JsonPrimitive
  | JsonifiableObject
  | JsonifiableArray;

// export type ReadonlyJsonifiableObject =
//   | { readonly [_ in string]?: ReadonlyJsonifiable }
//   | { readonly toJSON: () => ReadonlyJsonifiable };

// export type ReadonlyJsonifiableArray = readonly ReadonlyJsonifiable[];

// export type ReadonlyJsonifiable =
//   | JsonPrimitive
//   | ReadonlyJsonifiableObject
//   | ReadonlyJsonifiableArray;
