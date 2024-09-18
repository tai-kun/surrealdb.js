export type SlotLike<
  TName extends string = string,
  TRequired extends boolean = boolean,
  TValue = unknown,
> = {
  readonly name: TName;
  readonly isRequired: TRequired;
  readonly defaultValue?: TValue;
  readonly _parse: (value: unknown) => TValue;
};

export type PreparedQueryLike = {
  readonly text: string | { readonly __type: string };
  readonly vars: { readonly [p: string]: unknown };
  readonly slots: readonly SlotLike[];
  readonly _parse: (results: unknown[]) => unknown[];
  readonly _trans: (results: any) => unknown;
};
