import type { Auth, RecordAccessAuth } from "./auth";
import type { ReadonlyPatch } from "./patch";
import type { PreparedQueryLike } from "./surql";

// https://surrealdb.com/docs/surrealdb/integration/rpc#ping
export type RpcPingRequest = {
  readonly method: "ping";
  readonly params?: readonly [] | undefined;
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#use
export type RpcUseRequest = {
  readonly method: "use";
  readonly params: readonly [
    ns: string | null | undefined,
    db: string | null | undefined,
  ];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#info
export type RpcInfoRequest = {
  readonly method: "info";
  readonly params?: readonly [] | undefined;
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#signup
export type RpcSignupRequest = {
  readonly method: "signup";
  readonly params: readonly [auth: RecordAccessAuth];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#signin
export type RpcSigninRequest = {
  readonly method: "signin";
  readonly params: readonly [auth: Auth];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#authenticate
export type RpcAuthenticateRequest = {
  readonly method: "authenticate";
  readonly params: readonly [token: string];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#invalidate
export type RpcInvalidateRequest = {
  readonly method: "invalidate";
  readonly params?: readonly [] | undefined;
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#let
export type RpcLetRequest = {
  readonly method: "let";
  readonly params: readonly [name: string, value: unknown];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#unset
export type RpcUnsetRequest = {
  readonly method: "unset";
  readonly params: readonly [name: string];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#live
export type RpcLiveRequest = {
  readonly method: "live";
  readonly params: readonly [
    table: string | object,
    diff?: boolean | undefined,
  ];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#kill
export type RpcKillRequest = {
  readonly method: "kill";
  readonly params: readonly [queryUuid: string | object];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#query
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

// https://surrealdb.com/docs/surrealdb/integration/rpc#select
export type RpcSelectRequest = {
  readonly method: "select";
  readonly params: readonly [thing: string | object];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#create
export type RpcCreateRequest = {
  readonly method: "create";
  readonly params: readonly [
    thing: string | object,
    data?: { readonly [p: string]: unknown } | undefined,
  ];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#insert
export type RpcInsertRequest = {
  readonly method: "insert";
  readonly params: readonly [
    table: string | object | null | undefined,
    data?:
      | { readonly [p: string]: unknown }
      | readonly { readonly [p: string]: unknown }[]
      | undefined,
  ];
};

// // https://surrealdb.com/docs/surrealdb/integration/rpc#insert_relation
// export type RpcInsertRelationRequest = {
//   readonly method: "insert_relation";
//   readonly params: readonly [
//     table: string | object | null | undefined,
//     data?:
//       | { readonly [p: string]: unknown }
//       | readonly { readonly [p: string]: unknown }[]
//       | undefined,
//   ];
// };

// https://surrealdb.com/docs/surrealdb/integration/rpc#update
export type RpcUpdateRequest = {
  readonly method: "update";
  readonly params: readonly [
    thing: string | object,
    data?: { readonly [p: string]: unknown } | undefined,
  ];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#upsert
export type RpcUpsertRequest = {
  readonly method: "upsert";
  readonly params: readonly [
    thing: string | object,
    data?: { readonly [p: string]: unknown } | undefined,
  ];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#merge
export type RpcMergeRequest = {
  readonly method: "merge";
  readonly params: readonly [
    thing: string | object,
    data: { readonly [p: string]: unknown },
  ];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#patch
export type RpcPatchRequest = {
  readonly method: "patch";
  readonly params: readonly [
    thing: string | object,
    patches: readonly ReadonlyPatch[],
    diff?: boolean | undefined,
  ];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#delete
export type RpcDeleteRequest = {
  readonly method: "delete";
  readonly params: readonly [thing: string | object];
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#version
export type RpcVersionRequest = {
  readonly method: "version";
  readonly params?: readonly [] | undefined;
};

// https://surrealdb.com/docs/surrealdb/integration/rpc#run
export type RpcRunRequest = {
  readonly method: "run";
  readonly params: readonly [
    funcName: string,
    version?: string | undefined,
    args?: readonly unknown[] | undefined,
  ];
};

// // https://surrealdb.com/docs/surrealdb/integration/rpc#graphql
// export type RpcGraphqlRequest = {
//   readonly method: "graphql";
//   readonly params: readonly [
//     query:
//       | string
//       | {
//         readonly query: string;
//         readonly vars?: { readonly [p: string]: unknown } | undefined;
//         readonly variables?: { readonly [p: string]: unknown } | undefined;
//         readonly operation?: { readonly [p: string]: unknown } | undefined;
//         readonly operationName?: { readonly [p: string]: unknown } | undefined;
//       },
//     options?: {} | undefined,
//   ];
// };

// https://surrealdb.com/docs/surrealdb/integration/rpc#relate
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
  // | RpcInsertRelationRequest
  | RpcUpdateRequest
  | RpcUpsertRequest
  | RpcMergeRequest
  | RpcPatchRequest
  | RpcDeleteRequest
  | RpcVersionRequest
  | RpcRunRequest
  // | RpcGraphqlRequest
  | RpcRelateRequest;

export type RpcMethod = RpcRequest["method"];

export type RpcParams<TMethod extends RpcMethod = RpcMethod> = Extract<
  RpcRequest,
  { method: TMethod }
>["params"];
