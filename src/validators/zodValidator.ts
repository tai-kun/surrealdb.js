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
} from "~/index/types";
import {
  isTable,
  isThing,
  isUuid,
  type Table,
  type Thing,
  type Uuid,
} from "~/index/values";
import type { Validator } from "./_lib/types";

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

const JwtLike = z.string().refine(x => {
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
const ReadonlyEmptyArray = z.tuple([])
  .readonly() as unknown as ZodType<readonly []>;

const Table = z.custom<Table>(isTable);
const Thing = z.custom<Thing>(isThing);
const Uuid = z.custom<Uuid>(isUuid);

/******************************************************************************
 * Query Types
 *****************************************************************************/

const QueryResultBase = <S extends string>(status: S) =>
  z.object({
    status: z.literal(status),
    time: z.string(),
  });

const QueryResultOk = <T>(result: ZodType<T>): ZodType<QueryResultOk<T>> =>
  QueryResultBase("OK")
    .extend({ result })
    .strict()
    .transform(setRequired(["result"]));

const QueryResultErr: ZodType<QueryResultErr> = QueryResultBase("ERR")
  .extend({ result: z.string() })
  .strict()
  .transform(setRequired(["result"]));

const QueryResult = <T>(result: ZodType<T>): ZodType<QueryResult<T>> =>
  z.union([
    QueryResultOk(result),
    QueryResultErr,
  ]);

const RecordInputData: ZodType<RecordInputData> = z.record(z.unknown())
  .readonly();

const RecordData: ZodType<RecordData> = z.record(z.unknown());

/******************************************************************************
 * Patch Types
 *****************************************************************************/

const AddPatch = <T, P extends string>(
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

const RemovePatch = <P extends string>(
  path: ZodType<P>,
): ZodType<RemovePatch<P>> =>
  z.object({
    op: z.literal("remove"),
    path,
  })
    .strict()
    .transform(setRequired([]));

const ReplacePatch = <T, P extends string>(
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

const ChangePatch = <T extends string, P extends string>(
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

const CopyPatch = <F extends string, T extends string>(
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

const MovePatch = <F extends string, T extends string>(
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

const TestPatch = <T, P extends string>(
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

const Patch = <T>(value: ZodType<T>): ZodType<Patch<T>> =>
  z.union([
    AddPatch(value, z.string()),
    RemovePatch(z.string()),
    ReplacePatch(value, z.string()),
    ChangePatch(z.string(), z.string()),
    CopyPatch(z.string(), z.string()),
    MovePatch(z.string(), z.string()),
    TestPatch(value, z.string()),
  ]);

const ReadonlyPatch = <T>(value: ZodType<T>): ZodType<ReadonlyPatch<T>> =>
  z.union([
    AddPatch(value, z.string()).readonly(),
    RemovePatch(z.string()).readonly(),
    ReplacePatch(value, z.string()).readonly(),
    ChangePatch(z.string(), z.string()).readonly(),
    CopyPatch(z.string(), z.string()).readonly(),
    MovePatch(z.string(), z.string()).readonly(),
    TestPatch(value, z.string()).readonly(),
  ]);

/******************************************************************************
 * Live Query Types
 *****************************************************************************/

const LiveAction: ZodType<LiveAction> = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
]);

const LiveData = <T extends RecordData, I extends string | Uuid>(
  data: ZodType<T>,
  id: ZodType<I>,
): ZodType<LiveData<T, I>> =>
  z.object({
    action: LiveAction,
    id,
    result: data,
  })
    .strict()
    .transform(setRequired(["result"]));

const LiveDiff = <
  T extends RecordData,
  P extends readonly Patch[],
  I extends string | Uuid,
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

const LiveResult = <
  T extends RecordData,
  P extends readonly Patch[],
  I extends string | Uuid,
>(
  data: ZodType<T>,
  patch: ZodType<P>,
  id: ZodType<I>,
): ZodType<LiveResult<T, P, I>> =>
  z.union([
    LiveData(data, id),
    LiveDiff(data, patch, id),
  ]);

/******************************************************************************
 * Authentication Types
 *****************************************************************************/

const RootAuth: ZodType<RootAuth> = z.object({
  ns: z.null().optional(),
  db: z.null().optional(),
  sc: z.null().optional(),
  user: z.string(),
  pass: z.string(),
})
  .strict()
  .readonly();

const NamespaceAuth: ZodType<NamespaceAuth> = z.object({
  ns: z.string(),
  db: z.null().optional(),
  sc: z.null().optional(),
  user: z.string(),
  pass: z.string(),
})
  .strict()
  .readonly();

const DatabaseAuth: ZodType<DatabaseAuth> = z.object({
  ns: z.string(),
  db: z.string(),
  sc: z.null().optional(),
  user: z.string(),
  pass: z.string(),
})
  .strict()
  .readonly();

const ScopeAuth: ZodType<ScopeAuth> = z.object({
  ns: z.string(),
  db: z.string(),
  sc: z.string(),
})
  .catchall(z.unknown())
  .readonly();

const SystemAuth: ZodType<SystemAuth> = z.union([
  RootAuth,
  NamespaceAuth,
  DatabaseAuth,
]);

const Auth: ZodType<Auth> = z.union([
  SystemAuth,
  ScopeAuth,
]);

/******************************************************************************
 * RPC Request Types
 *****************************************************************************/

const RpcRequestBase = <
  M extends string,
  P extends ZodType<readonly unknown[]>,
>(
  method: M,
  params: P,
) =>
  z.object({
    method: z.literal(method),
    params,
  })
    .strict()
    .readonly();

const RpcPingRequest: ZodType<RpcPingRequest> = RpcRequestBase(
  "ping",
  ReadonlyEmptyArray,
);

const RpcUseRequest: ZodType<RpcUseRequest> = RpcRequestBase(
  "use",
  z.union([
    ReadonlyEmptyArray,
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

const RpcInfoRequest: ZodType<RpcInfoRequest> = RpcRequestBase(
  "info",
  ReadonlyEmptyArray,
);

const RpcSignupRequest: ZodType<RpcSignupRequest> = RpcRequestBase(
  "signup",
  z.tuple([ScopeAuth])
    .readonly(),
);

const RpcSigninRequest: ZodType<RpcSigninRequest> = RpcRequestBase(
  "signin",
  z.tuple([Auth])
    .readonly(),
);

const RpcAuthenticateRequest: ZodType<RpcAuthenticateRequest> = RpcRequestBase(
  "authenticate",
  z.tuple([JwtLike])
    .readonly(),
);

const RpcInvalidateRequest: ZodType<RpcInvalidateRequest> = RpcRequestBase(
  "invalidate",
  ReadonlyEmptyArray,
);

const RpcLetRequest: ZodType<RpcLetRequest> = RpcRequestBase(
  "let",
  z.tuple([
    z.string(),
    z.unknown(),
  ])
    .readonly(),
);

const RpcUnsetRequest: ZodType<RpcUnsetRequest> = RpcRequestBase(
  "unset",
  z.tuple([z.string()])
    .readonly(),
);

const RpcLiveRequest: ZodType<RpcLiveRequest> = RpcRequestBase(
  "live",
  z.union([
    z.tuple([
      z.union([
        z.string(),
        Table,
      ]),
    ])
      .readonly(),
    z.tuple([
      z.union([
        z.string(),
        Table,
      ]),
      z.boolean()
        .nullish(),
    ])
      .readonly(),
  ]),
);

const RpcKillRequest: ZodType<RpcKillRequest> = RpcRequestBase(
  "kill",
  z.tuple([
    z.union([
      z.string().uuid(),
      Uuid,
    ]),
  ])
    .readonly(),
);

const RpcQueryRequest: ZodType<RpcQueryRequest> = RpcRequestBase(
  "query",
  z.union([
    z.tuple([
      z.union([
        z.string(),
        z.object({
          text: z.string(),
          vars: RecordInputData
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
          vars: RecordInputData
            .nullish(),
        })
          .readonly(),
      ]),
      RecordInputData
        .nullish(),
    ])
      .readonly(),
  ]),
);

const RpcSelectRequest: ZodType<RpcSelectRequest> = RpcRequestBase(
  "select",
  z.tuple([
    z.union([
      z.string(),
      Thing,
    ]),
  ])
    .readonly(),
);

const RpcCreateRequest: ZodType<RpcCreateRequest> = RpcRequestBase(
  "create",
  z.union([
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
    ])
      .readonly(),
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
      RecordInputData
        .nullish(),
    ])
      .readonly(),
  ]),
);

const RpcInsertRequest: ZodType<RpcInsertRequest> = RpcRequestBase(
  "insert",
  z.union([
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
    ])
      .readonly(),
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
      z.union([
        RecordInputData,
        z.array(RecordInputData)
          .readonly(),
      ])
        .nullish(),
    ])
      .readonly(),
  ]),
);

const RpcUpdateRequest: ZodType<RpcUpdateRequest> = RpcRequestBase(
  "update",
  z.union([
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
    ])
      .readonly(),
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
      RecordInputData
        .nullish(),
    ])
      .readonly(),
  ]),
);

const RpcMergeRequest: ZodType<RpcMergeRequest> = RpcRequestBase(
  "merge",
  z.tuple([
    z.union([
      z.string(),
      Thing,
    ]),
    RecordInputData,
  ])
    .readonly(),
);

const RpcPatchRequest: ZodType<RpcPatchRequest> = RpcRequestBase(
  "patch",
  z.union([
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
      z.array(ReadonlyPatch(z.unknown()))
        .readonly(),
    ])
      .readonly(),
    z.tuple([
      z.union([
        z.string(),
        Thing,
      ]),
      z.array(ReadonlyPatch(z.unknown()))
        .readonly(),
      z.boolean()
        .nullish(),
    ])
      .readonly(),
  ]),
);

const RpcDeleteRequest: ZodType<RpcDeleteRequest> = RpcRequestBase(
  "delete",
  z.tuple([
    z.union([
      z.string(),
      Thing,
    ]),
  ])
    .readonly(),
);

const RpcVersionRequest: ZodType<RpcVersionRequest> = RpcRequestBase(
  "version",
  ReadonlyEmptyArray,
);

const RpcRunRequest: ZodType<RpcRunRequest> = RpcRequestBase(
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

const RpcRelateRequest: ZodType<RpcRelateRequest> = RpcRequestBase(
  "relate",
  z.union([
    z.tuple([
      z.union([
        z.string(),
        Thing,
        z.array(Thing)
          .readonly(),
      ]),
      z.union([
        z.string(),
        Thing,
      ]),
      z.union([
        z.string(),
        Thing,
        z.array(Thing)
          .readonly(),
      ]),
    ])
      .readonly(),
    z.tuple([
      z.union([
        z.string(),
        Thing,
        z.array(Thing)
          .readonly(),
      ]),
      z.union([
        z.string(),
        Thing,
      ]),
      z.union([
        z.string(),
        Thing,
        z.array(Thing)
          .readonly(),
      ]),
      RecordInputData
        .nullish(),
    ])
      .readonly(),
  ]),
);

const RpcRequest: ZodType<RpcRequest> = z.union([
  RpcPingRequest,
  RpcUseRequest,
  RpcInfoRequest,
  RpcSignupRequest,
  RpcSigninRequest,
  RpcAuthenticateRequest,
  RpcInvalidateRequest,
  RpcLetRequest,
  RpcUnsetRequest,
  RpcLiveRequest,
  RpcKillRequest,
  RpcQueryRequest,
  RpcSelectRequest,
  RpcCreateRequest,
  RpcInsertRequest,
  RpcUpdateRequest,
  RpcMergeRequest,
  RpcPatchRequest,
  RpcDeleteRequest,
  RpcVersionRequest,
  RpcRunRequest,
  RpcRelateRequest,
]);

/******************************************************************************
 * RPC Response Types
 *****************************************************************************/

const TableRecord = z.object({
  id: z.union([
    z.string(),
    Thing,
  ]),
})
  .catchall(z.unknown());

const RpcResultMapping: {
  [M in keyof RpcResultMapping]: ZodType<
    // dprint-ignore
    RpcResultMapping[M] extends void
      ? void | null | undefined
      : RpcResultMapping[M]
  >;
} = {
  ping: z.void().nullish(),
  use: z.void().nullish(),
  info: TableRecord,
  signup: JwtLike,
  signin: JwtLike,
  authenticate: z.void().nullish(),
  invalidate: z.void().nullish(),
  let: z.void().nullish(),
  unset: z.void().nullish(),
  live: z.union([
    z.string().uuid(),
    Uuid,
  ]),
  kill: z.void().nullish(),
  query: z.array(QueryResult(z.unknown())),
  select: z.union([
    TableRecord,
    z.array(TableRecord),
  ]),
  create: z.union([
    TableRecord,
    z.array(TableRecord),
  ]),
  insert: z.union([
    TableRecord,
    z.array(TableRecord),
  ]),
  update: z.union([
    TableRecord,
    z.array(TableRecord),
  ]),
  merge: z.union([
    TableRecord,
    z.array(TableRecord),
  ]),
  patch: z.union([
    TableRecord,
    z.array(TableRecord),
    z.array(
      z.union([
        Patch(z.unknown()),
        z.array(Patch(z.unknown())),
      ]),
    ),
  ]),
  delete: z.union([
    TableRecord,
    z.array(TableRecord),
  ]),
  version: z.string(),
  run: z.unknown(),
  relate: z.union([
    TableRecord,
    z.array(TableRecord),
  ]),
};

const BidirectionalRpcResponseBase = z.object({
  id: z.string()
    .regex(
      new RegExp("^" + Object.keys(RpcResultMapping).join("|") + "/.+$"),
    ) as ZodType<`${RpcMethod}/${string | number}`>,
});

const BidirectionalRpcResponseOk = <T>(
  result: ZodType<T>,
): ZodType<BidirectionalRpcResponseOk<T>> =>
  BidirectionalRpcResponseBase
    .extend({ result })
    .strict()
    .transform(setRequired(["result"]));

const BidirectionalRpcResponseErr: ZodType<BidirectionalRpcResponseErr> =
  BidirectionalRpcResponseBase
    .extend({
      error: z.object({
        code: z.number(),
        message: z.string(),
      }),
    })
    .strict();

const BidirectionalRpcResponse = <T>(
  result: ZodType<T>,
): ZodType<BidirectionalRpcResponse<T>> =>
  z.union([
    BidirectionalRpcResponseOk(result),
    BidirectionalRpcResponseErr,
  ]);

const IdLessRpcResponseOk = <T>(
  result: ZodType<T>,
): ZodType<IdLessRpcResponseOk<T>> =>
  z.object({
    result,
  })
    .strict()
    .transform(setRequired(["result"]));

const IdLessRpcResponseErr: ZodType<IdLessRpcResponseErr> = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
  }),
})
  .strict();

const IdLessRpcResponse = <T>(
  result: ZodType<T>,
): ZodType<IdLessRpcResponse<T>> =>
  z.union([
    IdLessRpcResponseOk(result),
    IdLessRpcResponseErr,
  ]);

const RpcResponse = <T extends ZodType<unknown>>(result: T) =>
  z.union([
    BidirectionalRpcResponse(result),
    IdLessRpcResponse(result),
  ]);

/******************************************************************************
 * Parse Methods
 *****************************************************************************/

const zodValidator: Validator = {
  parseRpcResult: (x, c) => RpcResultMapping[c.request.method].parse(x),
  parseLiveResult: x =>
    LiveResult(
      RecordData,
      z.array(Patch(z.unknown())),
      z.union([z.string().uuid(), Uuid]),
    )
      .parse(x),
  parseRpcRequest: x => RpcRequest.parse(x),
  parseRpcResponse: x => RpcResponse(z.unknown()).parse(x),
  parseIdLessRpcResponse: x => IdLessRpcResponse(z.unknown()).parse(x),
};

export default zodValidator;
