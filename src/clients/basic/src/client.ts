import {
  ClientAbc,
  type ClientConnectOptions,
  type ClientDisconnectOptions,
  type ClientRpcOptions,
} from "@tai-kun/surrealdb/client";
import { type EngineEvents, OPEN } from "@tai-kun/surrealdb/engine";
import {
  ConnectionConflictError,
  ConnectionUnavailableError,
  Disconnected,
  RpcResponseError,
  SurrealAggregateError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import type {
  RpcMethod,
  RpcParams,
  RpcResponse,
  RpcResult,
} from "@tai-kun/surrealdb/types";
import {
  getTimeoutSignal,
  mutex,
  type TaskRunnerArgs,
} from "@tai-kun/surrealdb/utils";

export default class BasicClient extends ClientAbc {
  private defaultErrorHandler(
    _args: TaskRunnerArgs,
    ...[error]: EngineEvents["error"]
  ): void {
    if (error.fatal) {
      console.error("[FATAL]", error);
      this.disconnect({ force: true }).then(null, reason => {
        console.error(reason);
      });
    } else {
      console.warn("[WARNING]", error);
    }
  }

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

      throw new ConnectionConflictError(conn.endpoint, endpoint);
    }

    this.ee.on("error", this.defaultErrorHandler);
    const protocol = endpoint.protocol.slice(0, -1 /* remove `:` */);
    const engine = await this.createEngine(protocol);
    const { signal = getTimeoutSignal(15_000) } = options;
    await engine.connect({ endpoint, signal });
    this.eng = engine;
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
        this.ee.abort(new Disconnected("force disconnect"));
      }

      const errors: unknown[] = [];

      try {
        await this.eng.disconnect({ signal });
      } catch (e) {
        errors.push(e);
      }

      try {
        await this.ee.idle();
      } catch (e) {
        errors.push(e);
      }

      switch (errors.length) {
        case 0:
          break;

        case 1:
          throw errors[0];

        case 2:
          // TODO(tai-kun): これいらんかも
          throw new SurrealAggregateError(
            "Failed to disconnect and dispose resources.",
            errors,
          );

        default:
          unreachable();
      }
    } finally {
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
    //     throw new ConnectionUnavailableError({
    //       cause: result.error,
    //     });
    //   }
    // }

    if (!this.eng) {
      throw new ConnectionUnavailableError();
    }

    const { signal = getTimeoutSignal(5_000) } = options;
    const resp: RpcResponse<any> = await this.eng.rpc({
      signal,
      // @ts-expect-error
      request: {
        method,
        params,
      },
    });

    if ("result" in resp) {
      return resp.result;
    }

    throw new RpcResponseError(resp);
  }
}
