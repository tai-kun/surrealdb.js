import type { Simplify } from "type-fest";
import { z } from "zod";
import type {
  AddPatch,
  Auth,
  BidirectionalRpcResponse,
  BidirectionalRpcResponseErr,
  BidirectionalRpcResponseOk,
  ChangePatch,
  CopyPatch,
  DatabaseAuth,
  IdLessRpcResponse,
  IdLessRpcResponseErr,
  IdLessRpcResponseOk,
  LiveAction,
  LiveData,
  LiveDiff,
  LiveResult,
  MovePatch,
  NamespaceAuth,
  Patch,
  QueryResult,
  QueryResultErr,
  QueryResultOk,
  ReadonlyPatch,
  RecordData,
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
  RpcMethod,
  RpcPatchRequest,
  RpcPingRequest,
  RpcQueryRequest,
  RpcRelateRequest,
  RpcRequest,
  RpcResponse,
  RpcResultMapping,
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
} from "../types";
import {
  isTable,
  isThing,
  isUuid,
  type TableAny,
  type ThingAny,
  type UuidAny,
} from "../values";
import Abc, { type ParseResponseContext } from "./Abc";

type ZodType<T> = z.ZodType<T, any, any>;

function setRequired<P extends string>(properties: readonly P[]) {
  return function transform<T extends { readonly [_ in string]?: unknown }>(
    arg: T,
    ctx: z.RefinementCtx,
  ): Simplify<
    & { [K in Exclude<keyof T, P>]: T[K] }
    & { [K in Extract<keyof T, P>]-?: T[K] }
  > {
    if (!(typeof arg === "object" && arg !== null)) {
      ctx.addIssue({
        code: "invalid_type",
        path: [...ctx.path],
        fatal: true,
        expected: "object",
        received: typeof arg,
      });
    } else {
      for (const prop of properties) {
        if (prop in arg) {
          continue;
        }

        ctx.addIssue({
          code: "custom",
          path: [...ctx.path, prop],
          fatal: true,
          message: `Expected an object with property ${prop}`,
          params: {
            properties,
          },
        });
      }
    }

    return arg as any;
  };
}

export default class ZodValidator extends Abc {
  JwtLike = z.string().refine(x => {
    const { source: base64Url } = /([0-9a-zA-Z_-]{4})*([0-9a-zA-Z_-]{2,3})?/;
    const JWT_REGEX = new RegExp([
      "^",
      base64Url,
      "\\.",
      base64Url,
      "\\.",
      base64Url,
      "$",
    ].join(""));

    return JWT_REGEX.test(x);
  });
  // [] を読み取り専用にすると readonly [] ではなく readonly never[] になるので、
  // 読み取り専用のから配列のスキーマを用意する。
  ReadonlyEmptyArray = z.tuple([])
    .readonly() as unknown as ZodType<readonly []>;

  Table = z.custom<TableAny>(isTable);
  Thing = z.custom<ThingAny>(isThing);
  Uuid = z.custom<UuidAny>(isUuid);

  /****************************************************************************
   * Query Types
   ***************************************************************************/

  QueryResultBase = <S extends string>(status: S) =>
    z.object({
      status: z.literal(status),
      time: z.string(),
    });

  QueryResultOk = <T>(result: ZodType<T>): ZodType<QueryResultOk<T>> =>
    this.QueryResultBase("OK")
      .extend({ result })
      .strict()
      .transform(setRequired(["result"]));

  QueryResultErr: ZodType<QueryResultErr> = this.QueryResultBase("ERR")
    .extend({ result: z.string() })
    .strict()
    .transform(setRequired(["result"]));

  QueryResult = <T>(result: ZodType<T>): ZodType<QueryResult<T>> =>
    z.union([
      this.QueryResultOk(result),
      this.QueryResultErr,
    ]);

  RecordInputData: ZodType<RecordInputData> = z.record(z.unknown())
    .readonly();

  RecordData: ZodType<RecordData> = z.record(z.unknown());

  /****************************************************************************
   * Patch Types
   ***************************************************************************/

  AddPatch = <T, P extends string>(
    value: ZodType<T>,
    path: ZodType<P>,
  ): ZodType<AddPatch<T, P>> =>
    z.object({
      op: z.literal("add"),
      path,
      value,
    })
      .strict()
      .transform(setRequired(["value"]));

  RemovePatch = <P extends string>(path: ZodType<P>): ZodType<RemovePatch<P>> =>
    z.object({
      op: z.literal("remove"),
      path,
    })
      .strict()
      .transform(setRequired([]));

  ReplacePatch = <T, P extends string>(
    value: ZodType<T>,
    path: ZodType<P>,
  ): ZodType<ReplacePatch<T, P>> =>
    z.object({
      op: z.literal("replace"),
      path,
      value,
    })
      .strict()
      .transform(setRequired(["value"]));

  ChangePatch = <T extends string, P extends string>(
    value: ZodType<T>,
    path: ZodType<P>,
  ): ZodType<ChangePatch<T, P>> =>
    z.object({
      op: z.literal("change"),
      path,
      value,
    })
      .strict()
      .transform(setRequired([]));

  CopyPatch = <F extends string, T extends string>(
    from: ZodType<F>,
    to: ZodType<T>,
  ): ZodType<CopyPatch<F, T>> =>
    z.object({
      op: z.literal("copy"),
      path: to,
      from,
    })
      .strict()
      .transform(setRequired([]));

  MovePatch = <F extends string, T extends string>(
    from: ZodType<F>,
    to: ZodType<T>,
  ): ZodType<MovePatch<F, T>> =>
    z.object({
      op: z.literal("move"),
      path: to,
      from,
    })
      .strict()
      .transform(setRequired([]));

  TestPatch = <T, P extends string>(
    value: ZodType<T>,
    path: ZodType<P>,
  ): ZodType<TestPatch<T, P>> =>
    z.object({
      op: z.literal("test"),
      path,
      value,
    })
      .strict()
      .transform(setRequired(["value"]));

  Patch = <T>(value: ZodType<T>): ZodType<Patch<T>> =>
    z.union([
      this.AddPatch(value, z.string()),
      this.RemovePatch(z.string()),
      this.ReplacePatch(value, z.string()),
      this.ChangePatch(z.string(), z.string()),
      this.CopyPatch(z.string(), z.string()),
      this.MovePatch(z.string(), z.string()),
      this.TestPatch(value, z.string()),
    ]);

  ReadonlyPatch = <T>(value: ZodType<T>): ZodType<ReadonlyPatch<T>> =>
    z.union([
      this.AddPatch(value, z.string()).readonly(),
      this.RemovePatch(z.string()).readonly(),
      this.ReplacePatch(value, z.string()).readonly(),
      this.ChangePatch(z.string(), z.string()).readonly(),
      this.CopyPatch(z.string(), z.string()).readonly(),
      this.MovePatch(z.string(), z.string()).readonly(),
      this.TestPatch(value, z.string()).readonly(),
    ]);

  /****************************************************************************
   * Live Query Types
   ***************************************************************************/

  LiveAction: ZodType<LiveAction> = z.enum([
    "CREATE",
    "UPDATE",
    "DELETE",
  ]);

  LiveData = <T extends RecordData, I extends string | UuidAny>(
    data: ZodType<T>,
    id: ZodType<I>,
  ): ZodType<LiveData<T, I>> =>
    z.object({
      action: this.LiveAction,
      id,
      result: data,
    })
      .strict()
      .transform(setRequired(["result"]));

  LiveDiff = <
    T extends RecordData,
    P extends readonly Patch[],
    I extends string | UuidAny,
  >(
    data: ZodType<T>,
    patch: ZodType<P>,
    id: ZodType<I>,
  ): ZodType<LiveDiff<T, P, I>> =>
    z.union([
      z.object({
        action: z.enum(["CREATE", "UPDATE"]),
        id,
        result: patch,
      })
        .strict()
        .transform(setRequired(["result"])),
      z.object({
        action: z.literal("DELETE"),
        id,
        result: data,
      })
        .strict()
        .transform(setRequired(["result"])),
    ]);

  LiveResult = <
    T extends RecordData,
    P extends readonly Patch[],
    I extends string | UuidAny,
  >(
    data: ZodType<T>,
    patch: ZodType<P>,
    id: ZodType<I>,
  ): ZodType<LiveResult<T, P, I>> =>
    z.union([
      this.LiveData(data, id),
      this.LiveDiff(data, patch, id),
    ]);

  /****************************************************************************
   * Authentication Types
   ***************************************************************************/

  RootAuth: ZodType<RootAuth> = z.object({
    ns: z.null().optional(),
    db: z.null().optional(),
    sc: z.null().optional(),
    user: z.string(),
    pass: z.string(),
  })
    .strict()
    .readonly();

  NamespaceAuth: ZodType<NamespaceAuth> = z.object({
    ns: z.string(),
    db: z.null().optional(),
    sc: z.null().optional(),
    user: z.string(),
    pass: z.string(),
  })
    .strict()
    .readonly();

  DatabaseAuth: ZodType<DatabaseAuth> = z.object({
    ns: z.string(),
    db: z.string(),
    sc: z.null().optional(),
    user: z.string(),
    pass: z.string(),
  })
    .strict()
    .readonly();

  ScopeAuth: ZodType<ScopeAuth> = z.object({
    ns: z.string(),
    db: z.string(),
    sc: z.string(),
  })
    .catchall(z.unknown())
    .readonly();

  SystemAuth: ZodType<SystemAuth> = z.union([
    this.RootAuth,
    this.NamespaceAuth,
    this.DatabaseAuth,
  ]);

  Auth: ZodType<Auth> = z.union([
    this.SystemAuth,
    this.ScopeAuth,
  ]);

  /****************************************************************************
   * RPC Request Types
   ***************************************************************************/

  RpcRequestBase = <M extends string, P extends ZodType<readonly unknown[]>>(
    method: M,
    params: P,
  ) =>
    z.object({
      method: z.literal(method),
      params,
    })
      .strict()
      .readonly();

  RpcPingRequest: ZodType<RpcPingRequest> = this.RpcRequestBase(
    "ping",
    this.ReadonlyEmptyArray,
  );

  RpcUseRequest: ZodType<RpcUseRequest> = this.RpcRequestBase(
    "use",
    z.union([
      this.ReadonlyEmptyArray,
      z.tuple([
        // ns
        z.string()
          .nullish(),
      ])
        .readonly(),
      z.tuple([
        // ns
        z.string()
          .nullish(),
        // db
        z.string()
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcInfoRequest: ZodType<RpcInfoRequest> = this.RpcRequestBase(
    "info",
    this.ReadonlyEmptyArray,
  );

  RpcSignupRequest: ZodType<RpcSignupRequest> = this.RpcRequestBase(
    "signup",
    z.tuple([this.ScopeAuth])
      .readonly(),
  );

  RpcSigninRequest: ZodType<RpcSigninRequest> = this.RpcRequestBase(
    "signin",
    z.tuple([this.Auth])
      .readonly(),
  );

  RpcAuthenticateRequest: ZodType<RpcAuthenticateRequest> = this.RpcRequestBase(
    "authenticate",
    z.tuple([this.JwtLike])
      .readonly(),
  );

  RpcInvalidateRequest: ZodType<RpcInvalidateRequest> = this.RpcRequestBase(
    "invalidate",
    this.ReadonlyEmptyArray,
  );

  RpcLetRequest: ZodType<RpcLetRequest> = this.RpcRequestBase(
    "let",
    z.tuple([
      z.string(),
      z.unknown(),
    ])
      .readonly(),
  );

  RpcUnsetRequest: ZodType<RpcUnsetRequest> = this.RpcRequestBase(
    "unset",
    z.tuple([z.string()])
      .readonly(),
  );

  RpcLiveRequest: ZodType<RpcLiveRequest> = this.RpcRequestBase(
    "live",
    z.union([
      z.tuple([
        z.union([
          z.string(),
          this.Table,
        ]),
      ])
        .readonly(),
      z.tuple([
        z.union([
          z.string(),
          this.Table,
        ]),
        z.boolean()
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcKillRequest: ZodType<RpcKillRequest> = this.RpcRequestBase(
    "kill",
    z.tuple([
      z.union([
        z.string().uuid(),
        this.Uuid,
      ]),
    ])
      .readonly(),
  );

  RpcQueryRequest: ZodType<RpcQueryRequest> = this.RpcRequestBase(
    "query",
    z.union([
      z.tuple([
        z.union([
          z.string(),
          z.object({
            text: z.string(),
            vars: this.RecordInputData
              .nullish(),
          })
            .readonly(),
        ]),
      ])
        .readonly(),
      z.tuple([
        z.union([
          z.string(),
          z.object({
            text: z.string(),
            vars: this.RecordInputData
              .nullish(),
          })
            .readonly(),
        ]),
        this.RecordInputData
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcSelectRequest: ZodType<RpcSelectRequest> = this.RpcRequestBase(
    "select",
    z.tuple([
      z.union([
        z.string(),
        this.Thing,
      ]),
    ])
      .readonly(),
  );

  RpcCreateRequest: ZodType<RpcCreateRequest> = this.RpcRequestBase(
    "create",
    z.union([
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
      ])
        .readonly(),
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
        this.RecordInputData
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcInsertRequest: ZodType<RpcInsertRequest> = this.RpcRequestBase(
    "insert",
    z.union([
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
      ])
        .readonly(),
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
        z.union([
          this.RecordInputData,
          z.array(this.RecordInputData)
            .readonly(),
        ])
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcUpdateRequest: ZodType<RpcUpdateRequest> = this.RpcRequestBase(
    "update",
    z.union([
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
      ])
        .readonly(),
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
        this.RecordInputData
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcMergeRequest: ZodType<RpcMergeRequest> = this.RpcRequestBase(
    "merge",
    z.tuple([
      z.union([
        z.string(),
        this.Thing,
      ]),
      this.RecordInputData,
    ])
      .readonly(),
  );

  RpcPatchRequest: ZodType<RpcPatchRequest> = this.RpcRequestBase(
    "patch",
    z.union([
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
        z.array(this.ReadonlyPatch(z.unknown()))
          .readonly(),
      ])
        .readonly(),
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
        ]),
        z.array(this.ReadonlyPatch(z.unknown()))
          .readonly(),
        z.boolean()
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcDeleteRequest: ZodType<RpcDeleteRequest> = this.RpcRequestBase(
    "delete",
    z.tuple([
      z.union([
        z.string(),
        this.Thing,
      ]),
    ])
      .readonly(),
  );

  RpcVersionRequest: ZodType<RpcVersionRequest> = this.RpcRequestBase(
    "version",
    this.ReadonlyEmptyArray,
  );

  RpcRunRequest: ZodType<RpcRunRequest> = this.RpcRequestBase(
    "run",
    z.union([
      z.tuple([
        z.string(),
      ])
        .readonly(),
      z.tuple([
        z.string(),
        z.string()
          .nullish(),
      ])
        .readonly(),
      z.tuple([
        z.string(),
        z.string()
          .nullish(),
        z.array(z.unknown())
          .readonly()
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcRelateRequest: ZodType<RpcRelateRequest> = this.RpcRequestBase(
    "relate",
    z.union([
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
          z.array(this.Thing)
            .readonly(),
        ]),
        z.union([
          z.string(),
          this.Thing,
        ]),
        z.union([
          z.string(),
          this.Thing,
          z.array(this.Thing)
            .readonly(),
        ]),
      ])
        .readonly(),
      z.tuple([
        z.union([
          z.string(),
          this.Thing,
          z.array(this.Thing)
            .readonly(),
        ]),
        z.union([
          z.string(),
          this.Thing,
        ]),
        z.union([
          z.string(),
          this.Thing,
          z.array(this.Thing)
            .readonly(),
        ]),
        this.RecordInputData
          .nullish(),
      ])
        .readonly(),
    ]),
  );

  RpcRequest: ZodType<RpcRequest> = z.union([
    this.RpcPingRequest,
    this.RpcUseRequest,
    this.RpcInfoRequest,
    this.RpcSignupRequest,
    this.RpcSigninRequest,
    this.RpcAuthenticateRequest,
    this.RpcInvalidateRequest,
    this.RpcLetRequest,
    this.RpcUnsetRequest,
    this.RpcLiveRequest,
    this.RpcKillRequest,
    this.RpcQueryRequest,
    this.RpcSelectRequest,
    this.RpcCreateRequest,
    this.RpcInsertRequest,
    this.RpcUpdateRequest,
    this.RpcMergeRequest,
    this.RpcPatchRequest,
    this.RpcDeleteRequest,
    this.RpcVersionRequest,
    this.RpcRunRequest,
    this.RpcRelateRequest,
  ]);

  /****************************************************************************
   * RPC Response Types
   ***************************************************************************/

  TableRecord = z.object({
    id: z.union([
      z.string(),
      this.Thing,
    ]),
  })
    .catchall(z.unknown());

  RpcResultMapping: {
    [M in keyof RpcResultMapping]: ZodType<
      // dprint-ignore
      RpcResultMapping[M] extends void
        ? void | null | undefined
        : RpcResultMapping[M]
    >;
  } = {
    ping: z.void().nullish(),
    use: z.void().nullish(),
    info: this.TableRecord,
    signup: this.JwtLike,
    signin: this.JwtLike,
    authenticate: z.void().nullish(),
    invalidate: z.void().nullish(),
    let: z.void().nullish(),
    unset: z.void().nullish(),
    live: z.union([
      z.string().uuid(),
      this.Uuid,
    ]),
    kill: z.void().nullish(),
    query: z.array(this.QueryResult(z.unknown())),
    select: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
    ]),
    create: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
    ]),
    insert: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
    ]),
    update: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
    ]),
    merge: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
    ]),
    patch: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
      z.array(
        z.union([
          this.Patch(z.unknown()),
          z.array(this.Patch(z.unknown())),
        ]),
      ),
    ]),
    delete: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
    ]),
    version: z.string(),
    run: z.unknown(),
    relate: z.union([
      this.TableRecord,
      z.array(this.TableRecord),
    ]),
  };

  BidirectionalRpcResponseBase = z.object({
    id: z.string()
      .regex(
        new RegExp("^" + Object.keys(this.RpcResultMapping).join("|") + "/.+$"),
      ) as ZodType<`${RpcMethod}/${string | number}`>,
  });

  BidirectionalRpcResponseOk = <T>(
    result: ZodType<T>,
  ): ZodType<BidirectionalRpcResponseOk<T>> =>
    this.BidirectionalRpcResponseBase
      .extend({ result })
      .strict()
      .transform(setRequired(["result"]));

  BidirectionalRpcResponseErr: ZodType<BidirectionalRpcResponseErr> = this
    .BidirectionalRpcResponseBase
    .extend({
      error: z.object({
        code: z.number(),
        message: z.string(),
      }),
    })
    .strict();

  BidirectionalRpcResponse = <T>(
    result: ZodType<T>,
  ): ZodType<BidirectionalRpcResponse<T>> =>
    z.union([
      this.BidirectionalRpcResponseOk(result),
      this.BidirectionalRpcResponseErr,
    ]);

  IdLessRpcResponseOk = <T>(
    result: ZodType<T>,
  ): ZodType<IdLessRpcResponseOk<T>> =>
    z.object({
      result,
    })
      .strict()
      .transform(setRequired(["result"]));

  IdLessRpcResponseErr: ZodType<IdLessRpcResponseErr> = z.object({
    error: z.object({
      code: z.number(),
      message: z.string(),
    }),
  })
    .strict();

  IdLessRpcResponse = <T>(result: ZodType<T>): ZodType<IdLessRpcResponse<T>> =>
    z.union([
      this.IdLessRpcResponseOk(result),
      this.IdLessRpcResponseErr,
    ]);

  RpcResponse = <T extends ZodType<unknown>>(result: T) =>
    z.union([
      this.BidirectionalRpcResponse(result),
      this.IdLessRpcResponse(result),
    ]);

  /****************************************************************************
   * Parse Methods
   ***************************************************************************/

  parseRpcResult = (x: unknown, c: ParseResponseContext) =>
    this.RpcResultMapping[c.request.method].parse(x);

  parseLiveResult = (x: LiveResult) =>
    this.LiveResult(
      this.RecordData,
      z.array(this.Patch(z.unknown())),
      z.union([z.string().uuid(), this.Uuid]),
    )
      .parse(x);

  parseRpcRequest = (x: RpcRequest) => this.RpcRequest.parse(x);

  parseRpcResponse = (x: RpcResponse) => this.RpcResponse(z.unknown()).parse(x);

  parseIdLessRpcResponse = (x: IdLessRpcResponse) =>
    this.IdLessRpcResponse(z.unknown()).parse(x);
}
