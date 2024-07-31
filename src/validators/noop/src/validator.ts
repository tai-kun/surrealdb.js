import type { LiveResult, RpcRequest } from "@tai-kun/surrealdb/types";
import {
  type ParseLiveResultArgs,
  type ParseRpcRequestArgs,
  type ParseRpcResultArgs,
  type Validator,
} from "@tai-kun/surrealdb/validator";

export default class NoOpValidator implements Validator {
  parseRpcRequest = (a: ParseRpcRequestArgs) => a.input as RpcRequest;
  parseRpcResult = (a: ParseRpcResultArgs) => a.input;
  parseLiveResult = (a: ParseLiveResultArgs) => a.input as LiveResult["result"];
}
