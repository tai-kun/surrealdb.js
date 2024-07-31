import type {
  LiveAction,
  LiveResult,
  RpcRequest,
} from "@tai-kun/surrealdb/types";

interface ParseContext {
  endpoint: URL;
  engine: string;
}

export interface ParseRpcRequestArgs extends ParseContext {
  input: {
    readonly method: unknown;
    readonly params?: unknown;
  };
}

export interface ParseRpcResultArgs extends ParseContext {
  input: unknown;
  request: RpcRequest;
}

export interface ParseLiveResultArgs extends ParseContext {
  input: unknown;
  action: LiveAction;
}

export interface Validator {
  readonly parseRpcRequest: (args: ParseRpcRequestArgs) => RpcRequest;
  readonly parseRpcResult: (args: ParseRpcResultArgs) => unknown;
  readonly parseLiveResult: (args: ParseLiveResultArgs) => LiveResult["result"];
}
