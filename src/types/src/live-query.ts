import type { Patch } from "./patch";

export type LiveAction = "CREATE" | "UPDATE" | "DELETE";

export type LiveData<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  I = unknown,
> = {
  action: LiveAction;
  id: I;
  result: T;
};

export type LiveDiff<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  P extends Patch[] = Patch[],
  I = unknown,
> = {
  action: "CREATE" | "UPDATE";
  id: I;
  result: P;
} | {
  action: "DELETE";
  id: I;
  result: T;
};

export type LiveResult<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  P extends Patch[] = Patch[],
  I = unknown,
> =
  | LiveData<T, I>
  | LiveDiff<T, P, I>;
