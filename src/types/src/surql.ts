export type SlotLike<
  N extends string = string,
  R extends boolean = boolean,
  V = unknown,
> = {
  readonly name: N;
  readonly isRequired: R;
  readonly defaultValue?: V;
};

export type PreparedQueryLike = {
  readonly text: string;
  readonly vars: { readonly [p: string]: unknown };
  readonly slots: readonly SlotLike[];
};
