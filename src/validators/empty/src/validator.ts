import type {
  IdLessRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "@tai-kun/surreal/types";
import type { Validator } from "../../_shared/types";

export default {
  parseRpcResult: x => x,
  parseLiveResult: x => x as LiveResult,
  parseRpcRequest: x => x as RpcRequest,
  parseRpcResponse: x => x as RpcResponse,
  parseIdLessRpcResponse: x => x as IdLessRpcResponse,
} satisfies Validator;
