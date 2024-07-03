import { getTimeoutSignal, mutex, TaskEmitter } from "~/_internal";
import { OPEN } from "~/engines";
import {
  ConnectionConflict,
  ConnectionUnavailable,
  EngineDisconnected,
  RpcResponseError,
  SurrealAggregateError,
  unreachable,
} from "~/errors";
import type {
  RpcMethod,
  RpcParams,
  RpcResponse,
  RpcResult,
} from "~/index/types";
import Abc, {
  type ClientConnectOptions,
  type ClientDisconnectOptions,
  ClientRpcOptions,
} from "./Abc";
import defaultErrorHandler from "./defaultErrorHandler";

export default class Client extends Abc {
  @mutex
  async connect(
    endpoint: string | URL,
    options: ClientConnectOptions | undefined = {},
  ): Promise<void> {
    const conn = this.getConnectionInfo();
    endpoint = new URL(endpoint); // コピー

    if (!endpoint.pathname.endsWith("/rpc")) {
      if (!endpoint.pathname.endsWith("/")) {
        endpoint.pathname += "/";
      }

      endpoint.pathname += "rpc";
    }

    if (conn?.state === OPEN) {
      if (conn.endpoint.href === endpoint.href) {
        return;
      }

      throw new ConnectionConflict(conn.endpoint, endpoint);
    }

    this.ee.on("error", (...args) => {
      defaultErrorHandler.apply(this, args);
    });
    const protocol = endpoint.protocol.slice(0, -1 /* remove `:` */);
    const engine = this.eng = await this.createEngine(protocol);
    const { signal = getTimeoutSignal(15_000) } = options;
    await engine.connect(endpoint, signal);
  }

  @mutex
  async disconnect(
    options: ClientDisconnectOptions | undefined = {},
  ): Promise<void> {
    if (!this.eng) {
      return;
    }

    const {
      force = false,
      signal = getTimeoutSignal(15_000),
    } = options;

    try {
      if (force) {
        this.ee.abort(new EngineDisconnected());
      }

      const errors: unknown[] = [];

      try {
        await this.eng.disconnect(signal);
      } catch (error) {
        errors.push(error);
      }

      try {
        await this.ee.dispose();
      } catch (error) {
        errors.push(error);
      }

      switch (errors.length) {
        case 0:
          break;

        case 1:
          throw errors[0];

        case 2:
          throw new SurrealAggregateError(
            "Failed to disconnect and dispose resources.",
            errors,
          );

        default:
          unreachable();
      }
    } finally {
      this.ee = new TaskEmitter();
      this.eng = null;
    }
  }

  async rpc<M extends RpcMethod, T extends RpcResult<M>>(
    method: M,
    params: RpcParams<M>,
    options: ClientRpcOptions | undefined = {},
  ): Promise<T> {
    // if (this.state === CONNECTING) {
    //   const [result] = await this.ee.once(OPEN, { signal });

    //   if ("error" in result) {
    //     throw new ConnectionUnavailable({
    //       cause: result.error,
    //     });
    //   }
    // }

    if (!this.eng) {
      throw new ConnectionUnavailable();
    }

    const { signal = getTimeoutSignal(5_000) } = options;
    const resp: RpcResponse<any> = await this.eng.rpc(
      // @ts-expect-error
      { method, params },
      signal,
    );

    if ("result" in resp) {
      return resp.result;
    }

    throw new RpcResponseError(resp);
  }
}

export type * from "./Abc";
