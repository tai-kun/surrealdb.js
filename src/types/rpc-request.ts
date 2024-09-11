import type { Auth, RecordAccessAuth } from "./auth";
import type { ReadonlyPatch } from "./patch";
import type { PreparedQueryLike } from "./surql";

export type RpcPingRequest = {
  readonly method: "ping";
  readonly params?: readonly [] | undefined;
};

export type RpcUseRequest = {
  readonly method: "use";
  readonly params: readonly [
    ns: string | null | undefined,
    db: string | null | undefined,
  ];
};

export type RpcInfoRequest = {
  readonly method: "info";
  readonly params?: readonly [] | undefined;
};

export type RpcSignupRequest = {
  readonly method: "signup";
  readonly params: readonly [auth: RecordAccessAuth];
};

export type RpcSigninRequest = {
  readonly method: "signin";
  readonly params: readonly [auth: Auth];
};

export type RpcAuthenticateRequest = {
  readonly method: "authenticate";
  readonly params: readonly [token: string];
};

export type RpcInvalidateRequest = {
  readonly method: "invalidate";
  readonly params?: readonly [] | undefined;
};

export type RpcLetRequest = {
  readonly method: "let";
  readonly params: readonly [name: string, value: unknown];
};

export type RpcUnsetRequest = {
  readonly method: "unset";
  readonly params: readonly [name: string];
};

export type RpcLiveRequest = {
  readonly method: "live";
  readonly params: readonly [
    table: string | object,
    diff?: boolean | undefined,
  ];
};

export type RpcKillRequest = {
  readonly method: "kill";
  readonly params: readonly [queryUuid: string | object];
};

export type RpcQueryRequest = {
  readonly method: "query";
  readonly params: readonly [
    surql:
      | string
      // SurrealDB の RPC に準拠していないため、リクエストを送信する前に変形させる必要あり。
      | PreparedQueryLike,
    vars?: { readonly [p: string]: unknown } | undefined,
  ];
};

export type RpcSelectRequest = {
  readonly method: "select";
  readonly params: readonly [thing: string | object];
};

export type RpcCreateRequest = {
  readonly method: "create";
  readonly params: readonly [
    thing: string | object,
    data?: { readonly [p: string]: unknown } | undefined,
  ];
};

export type RpcInsertRequest = {
  readonly method: "insert";
  readonly params: readonly [
    thing: string | object,
    data?:
      | { readonly [p: string]: unknown }
      | readonly { readonly [p: string]: unknown }[]
      | undefined,
  ];
};

export type RpcUpdateRequest = {
  readonly method: "update";
  readonly params: readonly [
    thing: string | object,
    data?: { readonly [p: string]: unknown } | undefined,
  ];
};

export type RpcUpsertRequest = {
  readonly method: "upsert";
  readonly params: readonly [
    thing: string | object,
    data?: { readonly [p: string]: unknown } | undefined,
  ];
};

export type RpcMergeRequest = {
  readonly method: "merge";
  readonly params: readonly [
    thing: string | object,
    data: { readonly [p: string]: unknown },
  ];
};

export type RpcPatchRequest = {
  readonly method: "patch";
  readonly params: readonly [
    thing: string | object,
    patches: readonly ReadonlyPatch[],
    diff?: boolean | undefined,
  ];
};

export type RpcDeleteRequest = {
  readonly method: "delete";
  readonly params: readonly [thing: string | object];
};

export type RpcVersionRequest = {
  readonly method: "version";
  readonly params?: readonly [] | undefined;
};

export type RpcRunRequest = {
  readonly method: "run";
  readonly params: readonly [
    funcName: string,
    version?: string | undefined,
    args?: readonly unknown[] | undefined,
  ];
};

export type RpcRelateRequest = {
  readonly method: "relate";
  readonly params: readonly [
    from: string | object | readonly object[],
    thing: string | object,
    to: string | object | readonly object[],
    data?: { readonly [p: string]: unknown } | undefined,
  ];
};

export type RpcRequest =
  | RpcPingRequest
  | RpcUseRequest
  | RpcInfoRequest
  | RpcSignupRequest
  | RpcSigninRequest
  | RpcAuthenticateRequest
  | RpcInvalidateRequest
  | RpcLetRequest
  | RpcUnsetRequest
  | RpcLiveRequest
  | RpcKillRequest
  | RpcQueryRequest
  | RpcSelectRequest
  | RpcCreateRequest
  | RpcInsertRequest
  | RpcUpdateRequest
  | RpcUpsertRequest
  | RpcMergeRequest
  | RpcPatchRequest
  | RpcDeleteRequest
  | RpcVersionRequest
  | RpcRunRequest
  | RpcRelateRequest;

export type RpcMethod = RpcRequest["method"];

export type RpcParams<M extends RpcMethod = RpcMethod> = Extract<
  RpcRequest,
  { method: M }
>["params"];
