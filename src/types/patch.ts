// https://github.com/surrealdb/surrealdb/blob/v2.0.0-alpha.7/core/src/sql/operation.rs

export type AddPatch<TValue = unknown, TPath extends string = string> = {
  op: "add";
  path: TPath;
  value: TValue;
};

export type RemovePatch<TPath extends string = string> = {
  op: "remove";
  path: TPath;
};

export type ReplacePatch<TValue = unknown, TPath extends string = string> = {
  op: "replace";
  path: TPath;
  value: TValue;
};

export type ChangePatch<
  TValue extends string = string,
  TPath extends string = string,
> = {
  op: "change";
  path: TPath;
  value: TValue;
};

export type CopyPatch<
  F extends string = string,
  TPath extends string = string,
> = {
  op: "copy";
  path: TPath;
  from: F;
};

export type MovePatch<
  F extends string = string,
  TPath extends string = string,
> = {
  op: "move";
  path: TPath;
  from: F;
};

export type TestPatch<TValue = unknown, TPath extends string = string> = {
  op: "test";
  path: TPath;
  value: TValue;
};

export type Patch<TValue = unknown> =
  | AddPatch<TValue>
  | RemovePatch
  | ReplacePatch<TValue>
  | ChangePatch
  | MovePatch
  | CopyPatch
  | TestPatch<TValue>;

export type ReadonlyPatch<TValue = unknown> =
  | Readonly<AddPatch<TValue>>
  | Readonly<RemovePatch>
  | Readonly<ReplacePatch<TValue>>
  | Readonly<ChangePatch>
  | Readonly<MovePatch>
  | Readonly<CopyPatch>
  | Readonly<TestPatch<TValue>>;
