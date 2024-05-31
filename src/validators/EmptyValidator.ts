import type {
  IdLessRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "../common/types";
import type { HttpEngineFetchResponse } from "../engines/HttpEngine";
import type { RpcData } from "../formatters/Formatter";
import { ok } from "../internal";
import { Validator } from "./Validator";

/**
 * The empty validator. This validator does not perform any validation.
 */
export class EmptyValidator extends Validator {
  parseRpcRequest(input: RpcRequest) {
    return ok(input, { unwrap: () => input });
  }

  parseRpcData(input: RpcData) {
    return ok(input, { unwrap: () => input });
  }

  parseFetchResponse(input: HttpEngineFetchResponse) {
    return ok(input, { unwrap: () => input });
  }

  parseIdLessRpcResponse(input: IdLessRpcResponse) {
    return ok(input, { unwrap: () => input });
  }

  parseRpcResponse(input: RpcResponse) {
    return ok(input, { unwrap: () => input });
  }

  parseRpcResult(input: unknown) {
    return ok(input, { unwrap: () => input });
  }

  parseLiveResult(input: LiveResult) {
    return ok(input, { unwrap: () => input });
  }
}
