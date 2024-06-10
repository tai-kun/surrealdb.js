import { CLOSED, OPEN } from "../../engines";
import {
  ConnectionConflict,
  ConnectionUnavailable,
  EngineDisconnected,
  RpcResponseError,
} from "../../errors";
import {
  type Err,
  err,
  mutex,
  type Ok,
  ok,
  TaskEmitter,
  timeoutSignal,
} from "../../internal";
import type { RpcMethod, RpcParams, RpcResponse, RpcResult } from "../../types";
import Abc, {
  type ClientDisconnectOptions,
  ClientRpcOptions,
} from "../ClientAbc";

export default class Client extends Abc {
  @mutex
  async connect(endpoint: string | URL): Promise<void> {
    endpoint = new URL(endpoint); // copy

    if (!endpoint.pathname.endsWith("/rpc")) {
      if (!endpoint.pathname.endsWith("/")) {
        endpoint.pathname += "/";
      }

      endpoint.pathname += "rpc";
    }

    if (this.state === OPEN) {
      if (this.conn?.connection.endpoint?.href === endpoint.href) {
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
    await engine.connect(endpoint);
  }

  @mutex
  async disconnect(
    options: ClientDisconnectOptions | undefined = {},
  ): Promise<
    | Ok
    | Ok<"AlreadyDisconnected">
    | Err<unknown>
  > {
    try {
      if (!this.conn || this.state === CLOSED) {
        return ok("AlreadyDisconnected");
      }

      const {
        force = false,
        signal = timeoutSignal(15_000),
      } = options;
      const promise = this.ee.once(CLOSED, { signal });

      if (force) {
        this.ee.abort(new EngineDisconnected());
      }

      const disconnResult = await this.conn.disconnect();

      try {
        const [result] = await promise;

        if (!result.ok) {
          throw result.error;
        }
      } finally {
        await this.ee.dispose();
      }

      const disposeResult = await this.ee.dispose();

      if (!disconnResult.ok) {
        throw disconnResult.error;
      }

      return disposeResult;
    } catch (error) {
      return err(error);
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
    if (!this.conn) {
      throw new ConnectionUnavailable();
    }

    const resp: RpcResponse<any> = await this.conn.rpc(
      // @ts-expect-error
      { method, params },
      options.signal || timeoutSignal(5_000),
    );

    if ("result" in resp) {
      return resp.result;
    }

    throw new RpcResponseError(resp);
  }
}
