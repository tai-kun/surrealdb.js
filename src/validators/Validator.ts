import type {
  IdLessRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "../common/types";
import type { HttpEngineFetchResponse } from "../engines/HttpEngine";
import type { RpcData } from "../formatters/Formatter";
import type { Err, Ok } from "../internal";

/**
 * A type that represents a validation result.
 *
 * @template T - The type of the value that was validated.
 */
export type ValidationResult<T> =
  | Ok<T, { unwrap(): T }>
  | Err<unknown, { unwrap(): never }>;

/**
 * Interface for a validator.
 */
export abstract class Validator {
  /**
   * Parses a RPC request.
   *
   * @param input - The object containing "method" and "params" fields.
   * @returns A validation result containing the valid RPC request.
   */
  abstract parseRpcRequest(
    input: Record<keyof RpcRequest, unknown>,
  ): ValidationResult<RpcRequest>;

  /**
   * Parses a RPC data.
   *
   * @param input - The unknown value to parse.
   * @returns A validation result containing the valid RPC data.
   */
  abstract parseRpcData(input: unknown): ValidationResult<RpcData>;

  /**
   * Parses a fetch response.
   *
   * @param input - The unknown value to parse.
   * @returns A validation result containing the valid fetch response.
   */
  abstract parseFetchResponse(
    input: unknown,
  ): ValidationResult<HttpEngineFetchResponse>;

  /**
   * Parses a id-less RPC response.
   *
   * @param input - The unknown value to parse.
   * @returns A validation result containing the valid id-less RPC response.
   */
  abstract parseIdLessRpcResponse(
    input: unknown,
  ): ValidationResult<IdLessRpcResponse>;

  /**
   * Parses a RPC response.
   *
   * @param input - The unknown value to parse.
   * @returns A validation result containing the valid RPC response.
   */
  abstract parseRpcResponse(input: unknown): ValidationResult<RpcResponse>;

  /**
   * Parses a RPC result.
   *
   * @param input - The unknown value to parse.
   * @param request - The RPC request associated with the result.
   * @returns A validation result containing the valid RPC result.
   */
  abstract parseRpcResult(
    input: unknown,
    request: RpcRequest,
  ): ValidationResult<unknown>;

  /**
   * Parses a live result.
   *
   * @param input - The unknown value to parse.
   * @returns A validation result containing the valid live result.
   */
  abstract parseLiveResult(input: unknown): ValidationResult<LiveResult>;
}
