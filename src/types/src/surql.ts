export type SlotLike<
  N extends string = string,
  R extends boolean = boolean,
  V = unknown,
> = {
  readonly name: N;
  readonly isRequired: R;
  readonly defaultValue?: V;
  readonly parse: (value: unknown) => V;
};

export type PreparedQueryLike = {
  readonly text: string | { readonly __type: string };
  readonly vars: { readonly [p: string]: unknown };
  readonly slots: readonly SlotLike[];
  readonly parse: (results: unknown[]) => unknown[];
};
