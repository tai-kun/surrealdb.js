import type {
  IdLessRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "~/index/types";
import type { Validator } from "./types";

const emptyValidator: Validator = {
  parseRpcResult: x => x,
  parseLiveResult: x => x as LiveResult,
  parseRpcRequest: x => x as RpcRequest,
  parseRpcResponse: x => x as RpcResponse,
  parseIdLessRpcResponse: x => x as IdLessRpcResponse,
};

export default emptyValidator;
