import type { Patch } from "./patch";

export type LiveAction = "CREATE" | "UPDATE" | "DELETE";

export namespace LiveResult {
  export type Data<
    TResult extends { [p: string]: unknown } = { [p: string]: unknown },
  > = {
    id: string | object;
    action: LiveAction;
    record: string | object;
    result: TResult;
  };

  export type Diff<
    TResult extends { [p: string]: unknown } = { [p: string]: unknown },
    TPatch extends Patch[] = Patch[],
  > = {
    id: string | object;
    action: "CREATE" | "UPDATE";
    record: string | object;
    result: TPatch;
  } | {
    id: string | object;
    action: "DELETE";
    record: string | object;
    result: TResult;
  };
}

export type LiveResult<
  TResult extends { [p: string]: unknown } = { [p: string]: unknown },
  TPatch extends Patch[] = Patch[],
> =
  | LiveResult.Data<TResult>
  | LiveResult.Diff<TResult, TPatch>;

export namespace LivePayload {
  export type Data<
    TResult extends { [p: string]: unknown } = { [p: string]: unknown },
    // internals
    _TThing = string | object,
  > = {
    action: LiveAction;
    record: string | _TThing;
    result: TResult;
  };

  export type Diff<
    TResult extends { [p: string]: unknown } = { [p: string]: unknown },
    TPatch extends Patch[] = Patch[],
    // internals
    _TThing = string | object,
  > = {
    action: "CREATE" | "UPDATE";
    record: string | _TThing;
    result: TPatch;
  } | {
    action: "DELETE";
    record: string | _TThing;
    result: TResult;
  };
}

export type LivePayload<
  TResult extends { [p: string]: unknown } = { [p: string]: unknown },
  TPatch extends Patch[] = Patch[],
  // internals
  _TThing = string | object,
> =
  | LivePayload.Data<TResult, _TThing>
  | LivePayload.Diff<TResult, TPatch, _TThing>;
