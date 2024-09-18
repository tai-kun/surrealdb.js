import type { Patch } from "./patch";

export type LiveAction = "CREATE" | "UPDATE" | "DELETE";

export namespace LiveResult {
  export type Data<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
  > = {
    id: string | object;
    action: LiveAction;
    record: string | object;
    result: T;
  };

  export type Diff<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    P extends Patch[] = Patch[],
  > = {
    id: string | object;
    action: "CREATE" | "UPDATE";
    record: string | object;
    result: P;
  } | {
    id: string | object;
    action: "DELETE";
    record: string | object;
    result: T;
  };
}

export type LiveResult<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  P extends Patch[] = Patch[],
> =
  | LiveResult.Data<T>
  | LiveResult.Diff<T, P>;

export namespace LivePayload {
  export type Data<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    // internals
    _TThing = string | object,
  > = {
    action: LiveAction;
    record: string | _TThing;
    result: T;
  };

  export type Diff<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    P extends Patch[] = Patch[],
    // internals
    _TThing = string | object,
  > = {
    action: "CREATE" | "UPDATE";
    record: string | _TThing;
    result: P;
  } | {
    action: "DELETE";
    record: string | _TThing;
    result: T;
  };
}

export type LivePayload<
  T extends { [p: string]: unknown } = { [p: string]: unknown },
  P extends Patch[] = Patch[],
  // internals
  _TThing = string | object,
> =
  | LivePayload.Data<T, _TThing>
  | LivePayload.Diff<T, P, _TThing>;
