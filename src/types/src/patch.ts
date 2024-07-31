// https://github.com/surrealdb/surrealdb/blob/v2.0.0-alpha.7/core/src/sql/operation.rs

export type AddPatch<T = unknown, P extends string = string> = {
  op: "add";
  path: P;
  value: T;
};

export type RemovePatch<P extends string = string> = {
  op: "remove";
  path: P;
};

export type ReplacePatch<T = unknown, P extends string = string> = {
  op: "replace";
  path: P;
  value: T;
};

export type ChangePatch<
  T extends string = string,
  P extends string = string,
> = {
  op: "change";
  path: P;
  value: T;
};

export type CopyPatch<
  F extends string = string,
  P extends string = string,
> = {
  op: "copy";
  path: P;
  from: F;
};

export type MovePatch<
  F extends string = string,
  P extends string = string,
> = {
  op: "move";
  path: P;
  from: F;
};

export type TestPatch<T = unknown, P extends string = string> = {
  op: "test";
  path: P;
  value: T;
};

export type Patch<T = unknown> =
  | AddPatch<T>
  | RemovePatch
  | ReplacePatch<T>
  | ChangePatch
  | MovePatch
  | CopyPatch
  | TestPatch<T>;

export type ReadonlyPatch<T = unknown> =
  | Readonly<AddPatch<T>>
  | Readonly<RemovePatch>
  | Readonly<ReplacePatch<T>>
  | Readonly<ChangePatch>
  | Readonly<MovePatch>
  | Readonly<CopyPatch>
  | Readonly<TestPatch<T>>;
