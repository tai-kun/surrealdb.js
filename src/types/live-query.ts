import type { Patch } from "./patch";

export type LiveAction = "CREATE" | "UPDATE" | "DELETE";

export type LiveData<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  I = unknown,
> = {
  id: I;
  action: LiveAction;
  result: T;
};

export type LiveDiff<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  P extends Patch[] = Patch[],
  I = unknown,
> = {
  id: I;
  action: "CREATE" | "UPDATE";
  result: P;
} | {
  id: I;
  action: "DELETE";
  result: T;
};

export type LiveResult<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  P extends Patch[] = Patch[],
  I = unknown,
> =
  | LiveData<T, I>
  | LiveDiff<T, P, I>;
