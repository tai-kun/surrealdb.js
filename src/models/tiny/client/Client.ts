import {
  type Err,
  err,
  mutex,
  type Ok,
  ok,
  TaskEmitter,
  timeoutSignal,
} from "~/_internal";
import {
  type AggregateTasksError,
  ConnectionConflict,
  ConnectionUnavailable,
  EngineDisconnected,
  RpcResponseError,
  unreachable,
} from "~/common/errors";
import type {
  RpcMethod,
  RpcParams,
  RpcResponse,
  RpcResult,
} from "~/common/types";
import { CLOSED, CONNECTING, OPEN } from "~/engines";
import Abc, {
  type ClientConnectOptions,
  type ClientDisconnectOptions,
  ClientRpcOptions,
} from "../../_client/Abc";

export default class Client extends Abc {
  @mutex
  async connect(
    endpoint: string | URL,
    options: ClientConnectOptions | undefined = {},
  ): Promise<void> {
    endpoint = new URL(endpoint); // copy

    if (!endpoint.pathname.endsWith("/rpc")) {
      if (!endpoint.pathname.endsWith("/")) {
        endpoint.pathname += "/";
      }

      endpoint.pathname += "rpc";
    }

    if (this.state === OPEN) {
      if (!this.conn?.connection.endpoint) {
        unreachable();
      }

      if (this.conn.connection.endpoint.href === endpoint.href) {
        return;
      }

      throw new ConnectionConflict(this.conn?.connection.endpoint, endpoint);
    }

    this.ee.on("error", (_, error) => {
      console.error(error);
      this.disconnect({ force: true }).then(result => {
        if (!result.ok) {
          console.error(result.error);
        }
      });
    });
    const protocol = endpoint.protocol.slice(0, -1 /* remove `:` */);
    const engine = this.conn = await this.createEngine(protocol);
    const { signal = timeoutSignal(15_000) } = options;
    await engine.connect(endpoint, signal);
  }

  @mutex
  async disconnect(
    options: ClientDisconnectOptions | undefined = {},
  ): Promise<
    | Ok
    | Ok<"AlreadyDisconnected">
    | Err<{
      disconnect?: unknown;
      dispose?: AggregateTasksError;
    }>
  > {
    try {
      if (!this.conn || this.state === CLOSED) {
        return ok("AlreadyDisconnected");
      }

      const {
        force = false,
        signal = timeoutSignal(15_000),
      } = options;

      if (force) {
        this.ee.abort(new EngineDisconnected());
      }

      const disconnResult = await this.conn.disconnect(signal);
      const disposeResult = await this.ee.dispose();

      if (!disconnResult.ok || !disposeResult.ok) {
        const error: {
          disconnect?: unknown;
          dispose?: AggregateTasksError;
        } = {};

        if (!disconnResult.ok) {
          error.disconnect = disconnResult.error;
        }

        if (!disposeResult.ok) {
          error.dispose = disposeResult.error;
        }

        return err(error);
      }

      return disposeResult;
    } finally {
      this.ee = new TaskEmitter();
      this.conn = null;
    }
  }

  async rpc<M extends RpcMethod, T extends RpcResult<M>>(
    method: M,
    params: RpcParams<M>,
    options: ClientRpcOptions | undefined = {},
  ): Promise<T> {
    const { signal = timeoutSignal(5_000) } = options;

    if (this.state === CONNECTING) {
      await this.ee.once(OPEN, { signal });
    }

    if (!this.conn) {
      throw new ConnectionUnavailable();
    }

    const resp: RpcResponse<any> = await this.conn.rpc(
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
