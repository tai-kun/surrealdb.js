import { z } from "zod";
import type {
  AddPatch,
  Auth,
  BidirectionalRpcResponse,
  BidirectionalRpcResponseErr,
  BidirectionalRpcResponseOk,
  CopyPatch,
  DatabaseAuth,
  IdLessRpcResponse,
  IdLessRpcResponseErr,
  IdLessRpcResponseOk,
  LiveAction,
  LiveResult,
  MovePatch,
  NamespaceAuth,
  Patch,
  RecordInputData,
  RemovePatch,
  ReplacePatch,
  RootAuth,
  RpcAuthenticateRequest,
  RpcCreateRequest,
  RpcDeleteRequest,
  RpcInfoRequest,
  RpcInsertRequest,
  RpcInvalidateRequest,
  RpcKillRequest,
  RpcLetRequest,
  RpcLiveRequest,
  RpcMergeRequest,
  RpcPatchRequest,
  RpcPingRequest,
  RpcQueryRequest,
  RpcRelateRequest,
  RpcRequest,
  RpcResponse,
  RpcRunRequest,
  RpcSelectRequest,
  RpcSigninRequest,
  RpcSignupRequest,
  RpcUnsetRequest,
  RpcUpdateRequest,
  RpcUseRequest,
  RpcVersionRequest,
  ScopeAuth,
  SystemAuth,
  TestPatch,
} from "../common/types";
import type { HttpEngineFetchResponse } from "../engines/HttpEngine";
import type { RpcData } from "../formatters/Formatter";
import { err, ok } from "../internal";
import {
  type AnyTable,
  type AnyThing,
  type AnyUuid,
  isTable,
  isThing,
  isUuid,
} from "../values/utils";
import { type ValidationResult, Validator } from "./Validator";

type Schema<T> = z.ZodType<T, any, any>;

function toV8nResult<T>(
  result: z.SafeParseReturnType<any, T>,
): ValidationResult<T> {
  if (result.success) {
    const { data: output } = result;

    return ok(output, { unwrap: () => output });
  } else {
    const { error } = result;

    return err(error, {
      unwrap() {
        throw error;
      },
    });
  }
}

/**
 * A Zod-based validator.
 */
export class ZodValidator extends Validator {
  AnyTableSchema: Schema<AnyTable> = z.custom(isTable);

  AnyThingSchema: Schema<AnyThing> = z.custom(isThing);

  AnyUuidSchema: Schema<AnyUuid> = z.custom(isUuid);

  /****************************************************************************
   * Query Schemas
   ***************************************************************************/

  RecordInputDataSchema = z
    .record(z.unknown()) satisfies Schema<RecordInputData>;

  /****************************************************************************
   * JSON Patch Schemas
   ***************************************************************************/

  AddPatchSchema = z.object({
    op: z.literal("add"),
    path: z.string(),
    value: z.custom<{} | null>(() => true),
  }).refine(input => "value" in input) satisfies Schema<AddPatch>;

  RemovePatchSchema = z.object({
    op: z.literal("remove"),
    path: z.string(),
  }) satisfies Schema<RemovePatch>;

  ReplacePatchSchema = z.object({
    op: z.literal("replace"),
    path: z.string(),
    value: z.custom<{} | null>(() => true),
  }).refine(input => "value" in input) satisfies Schema<ReplacePatch>;

  MovePatchSchema = z.object({
    op: z.literal("move"),
    path: z.string(),
    from: z.string(),
  }) satisfies Schema<MovePatch>;

  CopyPatchSchema = z.object({
    op: z.literal("copy"),
    path: z.string(),
    from: z.string(),
  }) satisfies Schema<CopyPatch>;

  TestPatchSchema = z.object({
    op: z.literal("test"),
    path: z.string(),
    value: z.custom<{} | null>(() => true),
  }).refine(input => "value" in input) satisfies Schema<TestPatch>;

  PatchSchema = z.union([
    this.AddPatchSchema,
    this.RemovePatchSchema,
    this.ReplacePatchSchema,
    this.MovePatchSchema,
    this.CopyPatchSchema,
    this.TestPatchSchema,
  ]) satisfies Schema<Patch>;

  /****************************************************************************
   * Live Query Schemas
   ***************************************************************************/

  LiveActionSchema = z.union([
    z.literal("CREATE"),
    z.literal("UPDATE"),
    z.literal("DELETE"),
  ]) satisfies Schema<LiveAction>;

  LiveResult = z.object({
    action: this.LiveActionSchema,
    id: z.union([
      z.string(),
      this.AnyUuidSchema,
    ]),
    result: z.custom<{}>(input => typeof input === "object" && !!input),
  }) satisfies Schema<LiveResult>;

  /****************************************************************************
   * Authentication Schemas
   ***************************************************************************/

  RootAuthSchema = z.object({
    ns: z.null().optional(),
    db: z.null().optional(),
    sc: z.null().optional(),
    user: z.string(),
    pass: z.string(),
  }) satisfies Schema<RootAuth>;

  NamespaceAuthSchema = z.object({
    ns: z.string(),
    db: z.null().optional(),
    sc: z.null().optional(),
    user: z.string(),
    pass: z.string(),
  }) satisfies Schema<NamespaceAuth>;

  DatabaseAuthSchema = z.object({
    ns: z.string(),
    db: z.string(),
    sc: z.null().optional(),
    user: z.string(),
    pass: z.string(),
  }) satisfies Schema<DatabaseAuth>;

  ScopeAuthSchema = z
    .object({
      ns: z.string(),
      db: z.string(),
      sc: z.string(),
    })
    .catchall(z.unknown()) satisfies Schema<ScopeAuth>;

  SystemAuthSchema = z.union([
    this.RootAuthSchema,
    this.NamespaceAuthSchema,
    this.DatabaseAuthSchema,
  ]) satisfies Schema<SystemAuth>;

  AuthSchema = z.union([
    this.SystemAuthSchema,
    this.ScopeAuthSchema,
  ]) satisfies Schema<Auth>;

  /****************************************************************************
   * RPC Request Schemas
   ***************************************************************************/

  RpcPingRequestSchema = z.object({
    method: z.literal("ping"),
    params: z.tuple([]),
  }) satisfies Schema<RpcPingRequest>;

  RpcUseRequestSchema = z.object({
    method: z.literal("use"),
    params: z.union([
      z.tuple([]),
      z.tuple([z.string().nullish()]),
      z.tuple([z.string().nullish(), z.string().nullish()]),
    ]),
  }) satisfies Schema<RpcUseRequest>;

  RpcInfoRequestSchema = z.object({
    method: z.literal("info"),
    params: z.tuple([]),
  }) satisfies Schema<RpcInfoRequest>;

  RpcSignupRequestSchema = z.object({
    method: z.literal("signup"),
    params: z.tuple([this.ScopeAuthSchema]),
  }) satisfies Schema<RpcSignupRequest>;

  RpcSigninRequestSchema = z.object({
    method: z.literal("signin"),
    params: z.tuple([this.AuthSchema]),
  }) satisfies Schema<RpcSigninRequest>;

  RpcAuthenticateRequestSchema = z.object({
    method: z.literal("authenticate"),
    params: z.tuple([z.string()]),
  }) satisfies Schema<RpcAuthenticateRequest>;

  RpcInvalidateRequestSchema = z.object({
    method: z.literal("invalidate"),
    params: z.tuple([]),
  }) satisfies Schema<RpcInvalidateRequest>;

  RpcLetRequestSchema = z.object({
    method: z.literal("let"),
    params: z.tuple([
      z.string(),
      z.unknown(),
    ]),
  }) satisfies Schema<RpcLetRequest>;

  RpcUnsetRequestSchema = z.object({
    method: z.literal("unset"),
    params: z.tuple([z.string()]),
  }) satisfies Schema<RpcUnsetRequest>;

  RpcLiveRequestSchema = z.object({
    method: z.literal("live"),
    params: z.union([
      z.tuple([
        z.union([
          z.string(),
          this.AnyTableSchema,
        ]),
      ]),
      z.tuple([
        z.union([
          z.string(),
          this.AnyTableSchema,
        ]),
        z.boolean().nullish(),
      ]),
    ]),
  }) satisfies Schema<RpcLiveRequest>;

  RpcKillRequestSchema = z.object({
    method: z.literal("kill"),
    params: z.tuple([
      z.union([
        z.string(),
        this.AnyUuidSchema,
      ]),
    ]),
  }) satisfies Schema<RpcKillRequest>;

  RpcQueryRequestSchema = z.object({
    method: z.literal("query"),
    params: z.union([
      z.tuple([
        z.union([
          z.string(),
          z.object({
            text: z.string(),
            vars: this.RecordInputDataSchema.nullish(),
          }),
        ]),
      ]),
      z.tuple([
        z.union([
          z.string(),
          z.object({
            text: z.string(),
            vars: this.RecordInputDataSchema.nullish(),
          }),
        ]),
        this.RecordInputDataSchema.nullish(),
      ]),
    ]),
  }) satisfies Schema<RpcQueryRequest>;

  RpcSelectRequestSchema = z.object({
    method: z.literal("select"),
    params: z.tuple([
      z.union([
        z.string(),
        this.AnyThingSchema,
      ]),
    ]),
  }) satisfies Schema<RpcSelectRequest>;

  RpcCreateRequestSchema = z.object({
    method: z.literal("create"),
    params: z.union([
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
      ]),
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
        this.RecordInputDataSchema.nullish(),
      ]),
    ]),
  }) satisfies Schema<RpcCreateRequest>;

  RpcInsertRequestSchema = z.object({
    method: z.literal("insert"),
    params: z.union([
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
      ]),
      z.tuple([
        z.string(),
        z
          .union([
            this.RecordInputDataSchema,
            z.array(this.RecordInputDataSchema),
          ])
          .nullish(),
      ]),
      z.tuple([
        this.AnyThingSchema,
        this.RecordInputDataSchema.nullish(),
      ]),
    ]),
  }) satisfies Schema<RpcInsertRequest>;

  RpcUpdateRequestSchema = z.object({
    method: z.literal("update"),
    params: z.union([
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
      ]),
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
        this.RecordInputDataSchema.nullish(),
      ]),
    ]),
  }) satisfies Schema<RpcUpdateRequest>;

  RpcMergeRequestSchema = z.object({
    method: z.literal("merge"),
    params: z.tuple([
      z.union([
        z.string(),
        this.AnyThingSchema,
      ]),
      this.RecordInputDataSchema,
    ]),
  }) satisfies Schema<RpcMergeRequest>;

  RpcPatchRequestSchema = z.object({
    method: z.literal("patch"),
    params: z.union([
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
        z.array(this.PatchSchema),
      ]),
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
        z.array(this.PatchSchema),
        z.boolean().nullish(),
      ]),
    ]),
  }) satisfies Schema<RpcPatchRequest>;

  RpcDeleteRequestSchema = z.object({
    method: z.literal("delete"),
    params: z.tuple([
      z.union([
        z.string(),
        this.AnyThingSchema,
      ]),
    ]),
  }) satisfies Schema<RpcDeleteRequest>;

  RpcVersionRequestSchema = z.object({
    method: z.literal("version"),
    params: z.tuple([]),
  }) satisfies Schema<RpcVersionRequest>;

  RpcRunRequestSchema = z.object({
    method: z.literal("run"),
    params: z.union([
      z.tuple([z.string()]),
      z.tuple([
        z.string(),
        z.string().nullable(),
      ]),
      z.tuple([
        z.string(),
        z.string().nullable(),
        z.array(z.unknown()).nullable(),
      ]),
    ]),
  }) satisfies Schema<RpcRunRequest>;

  RpcRelateRequestSchema = z.object({
    method: z.literal("relate"),
    params: z.union([
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
          z.array(this.AnyThingSchema),
        ]),
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
        z.union([
          z.string(),
          this.AnyThingSchema,
          z.array(this.AnyThingSchema),
        ]),
      ]),
      z.tuple([
        z.union([
          z.string(),
          this.AnyThingSchema,
          z.array(this.AnyThingSchema),
        ]),
        z.union([
          z.string(),
          this.AnyThingSchema,
        ]),
        z.union([
          z.string(),
          this.AnyThingSchema,
          z.array(this.AnyThingSchema),
        ]),
        this.RecordInputDataSchema.nullish(),
      ]),
    ]),
  }) satisfies Schema<RpcRelateRequest>;

  RpcRequestSchema = z.union([
    this.RpcPingRequestSchema,
    this.RpcUseRequestSchema,
    this.RpcInfoRequestSchema,
    this.RpcSignupRequestSchema,
    this.RpcSigninRequestSchema,
    this.RpcAuthenticateRequestSchema,
    this.RpcInvalidateRequestSchema,
    this.RpcLetRequestSchema,
    this.RpcUnsetRequestSchema,
    this.RpcLiveRequestSchema,
    this.RpcKillRequestSchema,
    this.RpcQueryRequestSchema,
    this.RpcSelectRequestSchema,
    this.RpcCreateRequestSchema,
    this.RpcInsertRequestSchema,
    this.RpcUpdateRequestSchema,
    this.RpcMergeRequestSchema,
    this.RpcPatchRequestSchema,
    this.RpcDeleteRequestSchema,
    this.RpcVersionRequestSchema,
    this.RpcRunRequestSchema,
    this.RpcRelateRequestSchema,
  ]) satisfies Schema<RpcRequest>;

  /****************************************************************************
   * RPC Response Schemas
   ***************************************************************************/

  RPC_METHODS = [
    "ping",
    "use",
    "info",
    "signup",
    "signin",
    "authenticate",
    "invalidate",
    "let",
    "unset",
    "live",
    "kill",
    "query",
    "select",
    "create",
    "insert",
    "update",
    "merge",
    "patch",
    "delete",
    "version",
    "run",
    "relate",
  ] as const;

  RpcIdSchema = z
    .string()
    .regex(new RegExp(`^(${this.RPC_METHODS.join("|")})\\/.+$`)) as Schema<
      `${(typeof this.RPC_METHODS)[number]}/${any}`
    >;

  BidirectionalRpcResponseOkSchema = z
    .object({
      id: this.RpcIdSchema,
      result: z.custom<{} | null>(() => true),
    })
    .refine(input => "result" in input) satisfies Schema<
      BidirectionalRpcResponseOk
    >;

  BidirectionalRpcResponseErrSchema = z.object({
    id: this.RpcIdSchema,
    error: z.object({
      code: z.number(),
      message: z.string(),
    }),
  }) satisfies Schema<BidirectionalRpcResponseErr>;

  BidirectionalRpcResponseSchema = z.union([
    this.BidirectionalRpcResponseOkSchema,
    this.BidirectionalRpcResponseErrSchema,
  ]) satisfies Schema<BidirectionalRpcResponse>;

  IdLessRpcResponseOkSchema = z
    .object({
      result: z.custom<{} | null>(() => true),
    })
    .refine(input => "result" in input) as Schema<IdLessRpcResponseOk>;

  IdLessRpcResponseErrSchema = z.object({
    error: z.object({
      code: z.number(),
      message: z.string(),
    }),
  }) as Schema<IdLessRpcResponseErr>;

  IdLessRpcResponseSchema = z.union([
    this.IdLessRpcResponseOkSchema,
    this.IdLessRpcResponseErrSchema,
  ]) satisfies Schema<IdLessRpcResponse>;

  RpcResponseSchema = z.union([
    this.BidirectionalRpcResponseSchema,
    this.IdLessRpcResponseSchema,
  ]) satisfies Schema<RpcResponse>;

  /****************************************************************************
   * RpcData Schema
   ***************************************************************************/

  RpcDataSchema = z.union([
    z.string(),
    z.instanceof(ArrayBuffer),
  ]) satisfies Schema<RpcData>;

  /****************************************************************************
   * HttpEngineFetchResponse Schema
   ***************************************************************************/

  HttpEngineFetchResponseSchema = z
    .any()
    .transform((input): any => ({
      get status() {
        return z.number().safe().int().positive().parse(input.status);
      },
      async arrayBuffer() {
        // TODO(tai-kun): Support Firefox.
        return z.instanceof(ArrayBuffer).parse(await input.arrayBuffer());
      },
    })) as Schema<HttpEngineFetchResponse>;

  /****************************************************************************
   * Validation Methods
   ***************************************************************************/

  parseRpcRequest(input: Record<keyof RpcRequest, unknown>) {
    const result = this.RpcRequestSchema.safeParse(input);

    return toV8nResult(result);
  }

  parseRpcData(input: unknown) {
    const result = this.RpcDataSchema.safeParse(input);

    return toV8nResult(result);
  }

  parseFetchResponse(input: unknown) {
    const result = this.HttpEngineFetchResponseSchema.safeParse(input);

    return toV8nResult(result);
  }

  parseIdLessRpcResponse(input: unknown) {
    const result = this.IdLessRpcResponseSchema.safeParse(input);

    return toV8nResult(result);
  }

  parseRpcResponse(input: unknown) {
    const result = this.RpcResponseSchema.safeParse(input);

    return toV8nResult(result);
  }

  // TODO(tai-kun): Implement this method.
  parseRpcResult(input: unknown) {
    return ok(input, { unwrap: () => input });
  }

  parseLiveResult(input: unknown) {
    const result = this.LiveResult.safeParse(input);

    return toV8nResult(result);
  }
}
