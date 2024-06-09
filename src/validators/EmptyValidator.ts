import type {
  IdLessRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "../types";
import Abc from "./Abc";

export default class EmptyValidator extends Abc {
  parseRpcResult = (x: unknown) => x;
  parseLiveResult = (x: LiveResult) => x;
  parseRpcRequest = (x: RpcRequest) => x;
  parseRpcResponse = (x: RpcResponse) => x;
  parseIdLessRpcResponse = (x: IdLessRpcResponse) => x;
}
