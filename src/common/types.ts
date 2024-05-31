import type { AnyTable, AnyThing, AnyUuid } from "../values/utils";

/******************************************************************************
 * Query Types
 *****************************************************************************/

interface QueryResultBase<S extends string> {
  /**
   * The status of the query.
   */
  status: S;
  /**
   * The time the query was executed.
   */
  time: string;
}

/**
 * Result type for a query that succeeded.
 *
 * @template T - The type of the result.
 */
export interface QueryResultOk<T = unknown> extends QueryResultBase<"OK"> {
  /**
   * The result of the query.
   */
  result: T;
}

/**
 * Result type for a query that failed.
 */
export interface QueryResultErr extends QueryResultBase<"ERR"> {
  /**
   * The error message.
   */
  result: string;
}

/**
 * Result type for a query.
 *
 * @template T - The type of the result.
 */
export type QueryResult<T = unknown> = QueryResultOk<T> | QueryResultErr;

/**
 * Type for record data used as input. This is read-only.
 */
export type RecordInputData = {
  readonly [key: string | number]: unknown;
};

/**
 * Type for record data used for general purposes. This is mutable.
 */
export type RecordData = {
  [key: string]: unknown;
};

/******************************************************************************
 * JSON Patch Types
 *****************************************************************************/

interface PatchBase<K extends string, P extends string> {
  /**
   * The operation to perform.
   */
  op: K;
  /**
   * The path to the value to modify.
   */
  path: P;
}

/**
 * JSON Patch operation to add a value.
 *
 * @template T - The type of the value to add.
 * @template P - The type of the path.
 * @see https://jsonpatch.com/#add
 */
export interface AddPatch<T = unknown, P extends string = string>
  extends PatchBase<"add", P>
{
  /**
   * The value to add.
   */
  value: T;
}

/**
 * JSON Patch operation to remove a value.
 *
 * @template T - The type of the value to remove
 * @template P - The type of the path.
 * @see https://jsonpatch.com/#remove
 */
export interface RemovePatch<P extends string = string>
  extends PatchBase<"remove", P>
{}

/**
 * JSON Patch operation to replace a value.
 *
 * @template T - The type of the value to replace.
 * @template P - The type of the path.
 * @see https://jsonpatch.com/#replace
 */
export interface ReplacePatch<T = unknown, P extends string = string>
  extends PatchBase<"replace", P>
{
  /**
   * The value to replace.
   */
  value: T;
}

/**
 * JSON Patch operation to move a value.
 *
 * @template F - The type of the path to move the value from.
 * @template P - The type of the path.
 * @see https://jsonpatch.com/#move
 */
export interface MovePatch<F extends string = string, P extends string = string>
  extends PatchBase<"move", P>
{
  /**
   * The path to move the value to.
   */
  from: F;
}

/**
 * JSON Patch operation to copy a value.
 *
 * @template F - The type of the path to copy the value from.
 * @template P - The type of the path.
 * @see https://jsonpatch.com/#copy
 */
export interface CopyPatch<F extends string = string, P extends string = string>
  extends PatchBase<"copy", P>
{
  /**
   * The path to copy the value from.
   */
  from: F;
}

/**
 * JSON Patch operation to test a value.
 *
 * @template T - The type of the value to test.
 * @template P - The type of the path.
 * @see https://jsonpatch.com/#test
 */
export interface TestPatch<T = unknown, P extends string = string>
  extends PatchBase<"test", P>
{
  /**
   * The value to test.
   */
  value: T;
}

/**
 * JSON Patch operation.
 *
 * @template T - The type of the value.
 * @see https://jsonpatch.com/
 */
export type Patch<T = unknown> =
  | AddPatch<T>
  | RemovePatch
  | ReplacePatch<T>
  | MovePatch
  | CopyPatch
  | TestPatch<T>;

/**
 * Readonly JSON Patch operation.
 *
 * @template T - The type of the value.
 * @see https://jsonpatch.com/
 */
export type ReadonlyPatch<T = unknown> =
  | Readonly<AddPatch<T>>
  | Readonly<RemovePatch>
  | Readonly<ReplacePatch<T>>
  | Readonly<MovePatch>
  | Readonly<CopyPatch>
  | Readonly<TestPatch<T>>;

/******************************************************************************
 * Live Query Types
 *****************************************************************************/

/**
 * The action that triggered the notification.
 */
export type LiveAction = "CREATE" | "UPDATE" | "DELETE";

/**
 * The result of a live query.
 * This data is stored in the `result` property of {@link IdLessRpcResponseOk}
 * in bidirectional communication.
 *
 * @template T - The type of the result.
 * @template I - The type of the id.
 */
export interface LiveResult<
  T = Record<string, unknown> | Patch,
  I = string | AnyUuid,
> {
  /**
   * The action that triggered the notification.
   */
  action: LiveAction;
  /**
   * The id of the document.
   */
  id: I;
  /**
   * The result of the query.
   */
  result: T;
}

/******************************************************************************
 * Authentication Types
 *****************************************************************************/

/**
 * The authentication information for a root-level user.
 */
export interface RootAuth {
  /** The namespace to authenticate with. */
  readonly ns?: null | undefined;
  /** The database to authenticate with. */
  readonly db?: null | undefined;
  /** The scope to authenticate with. */
  readonly sc?: null | undefined;
  /** The user name to authenticate with. */
  readonly user: string;
  /** The password to authenticate with. */
  readonly pass: string;
}

/**
 * The authentication information for a namespace-level user.
 */
export interface NamespaceAuth {
  /** The namespace to authenticate with. */
  readonly ns: string;
  /** The database to authenticate with. */
  readonly db?: null | undefined;
  /** The scope to authenticate with. */
  readonly sc?: null | undefined;
  /** The user name to authenticate with. */
  readonly user: string;
  /** The password to authenticate with. */
  readonly pass: string;
}

/**
 * The authentication information for a database-level user.
 */
export interface DatabaseAuth {
  /** The namespace to authenticate with. */
  readonly ns: string;
  /** The database to authenticate with. */
  readonly db: string;
  /** The scope to authenticate with. */
  readonly sc?: null | undefined;
  /** The user name to authenticate with. */
  readonly user: string;
  /** The password to authenticate with. */
  readonly pass: string;
}

/**
 * The authentication information for a scoped user.
 */
export interface ScopeAuth {
  /** The namespace to authenticate with. */
  readonly ns: string;
  /** The database to authenticate with. */
  readonly db: string;
  /** The scope to authenticate with. */
  readonly sc: string;
  /** Values to authenticate with. */
  readonly [key: string | number]: unknown; // RecordInputData
}

/**
 * The authentication information for a system user.
 */
export type SystemAuth = RootAuth | NamespaceAuth | DatabaseAuth;

/**
 * The authentication information for a user.
 */
export type Auth = SystemAuth | ScopeAuth;

/******************************************************************************
 * RPC Request Types
 *****************************************************************************/

interface RpcRequestBase<M extends string, P extends readonly unknown[]> {
  /**
   * The name of the method to call.
   */
  readonly method: M;
  /**
   * The parameters to pass to the method.
   */
  readonly params: P;
}

/**
 * RPC request to ping the server.
 */
export interface RpcPingRequest extends RpcRequestBase<"ping", readonly []> {}

/**
 * RPC request to specifies the namespace and database for the current connection.
 */
export interface RpcUseRequest extends
  RpcRequestBase<
    "use",
    readonly [
      ns?: string | null | undefined,
      db?: string | null | undefined,
    ]
  >
{}

/**
 * RPC request to selects everything from the `$auth` variable.
 */
export interface RpcInfoRequest extends RpcRequestBase<"info", readonly []> {}

/**
 * RPC request to signup a user against a scope's `SIGNUP` method.
 */
export interface RpcSignupRequest
  extends RpcRequestBase<"signup", readonly [auth: ScopeAuth]>
{}

/**
 * RPC request to signin a root, namespace, database, or scope user against SurrealDB.
 */
export interface RpcSigninRequest
  extends RpcRequestBase<"signin", readonly [auth: Auth]>
{}

/**
 * RPC request to authenticate a user against SurrealDB with a token.
 */
export interface RpcAuthenticateRequest
  extends RpcRequestBase<"authenticate", readonly [token: string]>
{}

/**
 * RPC request to invalidate a user's session for the current connection.
 */
export interface RpcInvalidateRequest
  extends RpcRequestBase<"invalidate", readonly []>
{}

/**
 * RPC request ot define a variable on the current connection.
 */
export interface RpcLetRequest extends
  RpcRequestBase<
    "let",
    readonly [
      name: string,
      value: unknown,
    ]
  >
{}

/**
 * RPC request to remove a variable from the current connection.
 */
export interface RpcUnsetRequest extends
  RpcRequestBase<
    "unset",
    readonly [name: string]
  >
{}

/**
 * RPC request to initiate a live query
 */
export interface RpcLiveRequest extends
  RpcRequestBase<
    "live",
    readonly [
      table: string | AnyTable,
      diff?: boolean | null | undefined,
    ]
  >
{}

/**
 * RPC request to terminate a running live query.
 */
export interface RpcKillRequest extends
  RpcRequestBase<
    "kill",
    readonly [queryUuid: string | AnyUuid]
  >
{}

/**
 * RPC request to execute a custom query with optional variables.
 */
export interface RpcQueryRequest extends
  RpcRequestBase<
    "query",
    readonly [
      surql: string | {
        readonly text: string;
        readonly vars?: RecordInputData | null | undefined;
      },
      vars?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * RPC request to select either all records in a table or a single record.
 */
export interface RpcSelectRequest extends
  RpcRequestBase<
    "select",
    readonly [thing: string | AnyThing]
  >
{}

/**
 * RPC request to create a record with a random or specified ID.
 */
export interface RpcCreateRequest extends
  RpcRequestBase<
    "create",
    readonly [
      thing: string | AnyThing,
      data?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * RPC request to insert one or multiple records into a table.
 */
export interface RpcInsertRequest extends
  RpcRequestBase<
    "insert",
    readonly [
      thing: string | AnyThing,
      data?: RecordInputData | readonly RecordInputData[] | null | undefined,
    ]
  >
{}

/**
 * RPC request to replace either all records in a table or a single record with specified data.
 */
export interface RpcUpdateRequest extends
  RpcRequestBase<
    "update",
    readonly [
      thing: string | AnyThing,
      data?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * RPC request to merge specified data into either all records in a table or a single record.
 */
export interface RpcMergeRequest extends
  RpcRequestBase<
    "merge",
    readonly [
      thing: string | AnyThing,
      data: RecordInputData,
    ]
  >
{}

/**
 * RPC request to patch either all records in a table or a single record with specified patches.
 */
export interface RpcPatchRequest extends
  RpcRequestBase<
    "patch",
    readonly [
      thing: string | AnyThing,
      patches: readonly ReadonlyPatch[],
      diff?: boolean | null | undefined,
    ]
  >
{}

/**
 * RPC request to delete either all records in a table or a single record.
 */
export interface RpcDeleteRequest extends
  RpcRequestBase<
    "delete",
    readonly [thing: string | AnyThing]
  >
{}

/**
 * RPC request to get server version.
 */
export interface RpcVersionRequest
  extends RpcRequestBase<"version", readonly []>
{}

/**
 * RPC request to run a SurrealQL function.
 */
export interface RpcRunRequest extends
  RpcRequestBase<
    "run",
    readonly [
      funcName: string,
      version?: string | null | undefined,
      args?: readonly unknown[] | null | undefined,
    ]
  >
{}

/**
 * RPC request to generate graph edges between records in the database.
 */
export interface RpcRelateRequest extends
  RpcRequestBase<
    "relate",
    readonly [
      from: string | AnyThing | readonly AnyThing[],
      thing: string | AnyThing,
      to: string | AnyThing | readonly AnyThing[],
      data?: RecordInputData | null | undefined,
    ]
  >
{}

/**
 * RPC request.
 */
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
  | RpcMergeRequest
  | RpcPatchRequest
  | RpcDeleteRequest
  | RpcVersionRequest
  | RpcRunRequest
  | RpcRelateRequest;

/**
 * The method of an RPC request.
 */
export type RpcMethod = RpcRequest["method"];

/**
 * The parameters of an RPC request.
 *
 * @template M - The method of the request.
 */
export type RpcParams<M extends RpcMethod = RpcMethod> = Extract<
  RpcRequest,
  { method: M }
>["params"];

/******************************************************************************
 * RPC Response Types
 *****************************************************************************/

type Arrayable<T> = T | T[];

type TableRecord = { id: string | AnyThing } & RecordData;

/**
 * Mapping of RPC request methods to their response results.
 */
export interface RpcResultMapping {
  ping: void;
  use: void;
  info: TableRecord;
  signup: string;
  signin: string;
  authenticate: void;
  invalidate: void;
  let: void;
  unset: void;
  live: string | AnyUuid;
  kill: void;
  query: QueryResult[];
  select: Arrayable<TableRecord>;
  create: Arrayable<TableRecord>;
  insert: Arrayable<TableRecord>;
  update: Arrayable<TableRecord>;
  merge: Arrayable<TableRecord>;
  patch: Arrayable<TableRecord> | Arrayable<Patch>[];
  delete: Arrayable<TableRecord>;
  version: string;
  run: unknown;
  relate: Arrayable<TableRecord>;
}

/**
 * Result when RPC request is successful.
 *
 * @template M - The method of the request.
 */
export type RpcResult<M extends RpcMethod = RpcMethod> = RpcResultMapping[M];

interface BidirectionalRpcResponseBase {
  /**
   * The id of the request.
   *
   * **Note:**
   * This needs to be a valid string for the request ID.
   * For example, a format like `<letter>:<number>` would be parsed as a record ID,
   * rendering the request invalid.
   *
   * @see https://github.com/surrealdb/surrealdb/blob/v1.5.1/core/src/rpc/request.rs#L35-L44
   */
  id: `${RpcMethod}/${string | number}`;
}

/**
 * Response when RPC request is successful.
 *
 * @template T - The type of the result.
 */
export interface BidirectionalRpcResponseOk<T = unknown>
  extends BidirectionalRpcResponseBase
{
  /**
   * The result of the request.
   */
  result: T;
  /**
   * The error of the request.
   * This property is not present when the request is successful.
   */
  error?: never;
}

/**
 * Response when RPC request fails.
 */
export interface BidirectionalRpcResponseErr
  extends BidirectionalRpcResponseBase
{
  /**
   * The result of the request.
   * This property is not present when the request fails.
   */
  result?: never;
  /**
   * The error of the request.
   */
  error: {
    /**
     * The code of the error.
     */
    code: number;
    /**
     * The message of the error.
     */
    message: string;
  };
}

/**
 * Response when RPC request.
 *
 * @template T - The type of the result.
 */
export type BidirectionalRpcResponse<T = unknown> =
  | BidirectionalRpcResponseOk<T>
  | BidirectionalRpcResponseErr;

/**
 * Response when RPC request is successful.
 *
 * @template T - The type of the result.
 */
export interface IdLessRpcResponseOk<T = unknown>
  extends Omit<BidirectionalRpcResponseOk<T>, "id">
{}

/**
 * Response when RPC request fails.
 */
export interface IdLessRpcResponseErr
  extends Omit<BidirectionalRpcResponseErr, "id">
{}

/**
 * Response when RPC request.
 *
 * @template T - The type of the result.
 */
export type IdLessRpcResponse<T = unknown> =
  | IdLessRpcResponseOk<T>
  | IdLessRpcResponseErr;

/**
 * Response when RPC request.
 *
 * @template T - The type of the result.
 */
export type RpcResponse<T = unknown> =
  | BidirectionalRpcResponse<T>
  | IdLessRpcResponse<T>;

/******************************************************************************
 * Other Types
 *****************************************************************************/

/**
 * The type of a blob-like object.
 */
export type BlobLike = {
  /**
   * Returns a promise that resolves with the blob as an array buffer.
   */
  readonly arrayBuffer: () => PromiseLike<ArrayBuffer>;
};

/**
 * The type of an array buffer view.
 */
export type ArrayBufferView = {
  /**
   * The ArrayBuffer instance referenced by the array.
   */
  readonly buffer: ArrayBuffer;
  /**
   * The length in bytes of the array.
   */
  readonly byteLength: number;
  /**
   * The offset in bytes of the array.
   */
  readonly byteOffset: number;
};

/**
 * The type of raw data returned from an RPC response.
 */
export type RpcResponseRawData =
  | string
  | ArrayBuffer
  | BlobLike
  | ArrayBufferView;
