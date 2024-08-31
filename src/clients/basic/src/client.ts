import {
  type ConnectionInfo,
  type ConnectionState,
  type EngineAbc,
  type EngineAbcConfig,
  type EngineEventMap,
  processEndpoint,
} from "@tai-kun/surrealdb/engine";
import {
  CircularEngineReferenceError,
  ConnectionConflictError,
  ConnectionUnavailableError,
  Disconnected,
  EngineNotFoundError,
  RpcResponseError,
  SurrealTypeError,
} from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import type {
  RpcMethod,
  RpcParams,
  RpcResponse,
  RpcResult,
} from "@tai-kun/surrealdb/types";
import {
  getTimeoutSignal,
  mutex,
  type StatefulPromise,
  TaskEmitter,
  type TaskListener,
  type TaskListenerOptions,
} from "@tai-kun/surrealdb/utils";

export type CreateEngine = (config: EngineAbcConfig) =>
  | EngineAbc
  | PromiseLike<EngineAbc>;

export type ClientEngines = {
  readonly [_ in string]?: CreateEngine | string | undefined;
};

export interface ClientConfig {
  readonly engines: ClientEngines;
  readonly formatter: Formatter;
  readonly disableDefaultErrorHandler?: boolean | undefined;
}

export interface ClientConnectOptions {
  readonly signal?: AbortSignal | undefined;
}

export interface ClientDisconnectOptions {
  readonly force?: boolean | undefined;
  readonly signal?: AbortSignal | undefined;
}

export interface ClientRpcOptions {
  readonly signal?: AbortSignal | undefined;
}

export default class BasicClient {
  protected readonly ee: TaskEmitter<EngineEventMap> = new TaskEmitter();
  protected readonly fmt: Formatter;
  protected eng: EngineAbc | null = null;

  private readonly _engines: ClientEngines;

  constructor(config: ClientConfig) {
    const {
      engines,
      formatter,
      disableDefaultErrorHandler,
    } = config;
    this.fmt = formatter;
    this._engines = { ...engines }; // Shallow copy

    if (!disableDefaultErrorHandler) {
      this.ee.on("error", (_, e) => {
        if (e.fatal) {
          console.error("[@tai-kun/surrealdb]", "FATAL", e);
          this.disconnect({ force: true }).then(null, reason => {
            console.error("[@tai-kun/surrealdb]", reason);
          });
        } else {
          console.warn("[@tai-kun/surrealdb]", "WARNING", e);
        }
      });
    }
  }

  protected async createEngine(protocol: string): Promise<EngineAbc> {
    let engine = this._engines[protocol];
    const seen: string[] = [];

    while (typeof engine === "string") {
      if (seen.includes(engine)) {
        throw new CircularEngineReferenceError(seen);
      }

      seen.push(engine);
      engine = this._engines[engine];
    }

    if (!engine) {
      throw new EngineNotFoundError(protocol);
    }

    return await engine({
      emitter: this.ee,
      formatter: this.fmt,
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#state)
   */
  get state(): ConnectionState {
    return this.eng?.state ?? "closed";
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#endpoint)
   */
  get endpoint(): URL | null | undefined {
    return this.eng?.endpoint;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#namespace)
   */
  get namespace(): string | null | undefined {
    return this.eng?.namespace;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#database)
   */
  get database(): string | null | undefined {
    return this.eng?.database;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#token)
   */
  get token(): string | null | undefined {
    return this.eng?.token;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#getconnectioninfo)
   */
  getConnectionInfo(): ConnectionInfo | undefined {
    return this.eng?.getConnectionInfo();
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#on)
   */
  on<K extends keyof EngineEventMap>(
    event: K,
    listener: TaskListener<EngineEventMap[K]>,
  ): void {
    this.ee.on(event, listener);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#off)
   */
  off<K extends keyof EngineEventMap>(
    event: K,
    listener: TaskListener<EngineEventMap[K]>,
  ): void {
    // 誤ってすべてのイベントリスナーを解除してしまわないようにするため、
    // listener が無い場合はエラーを投げる。
    if (typeof listener !== "function") {
      throw new SurrealTypeError("Function", listener);
    }

    this.ee.off(event, listener);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#once)
   */
  once<K extends keyof EngineEventMap>(
    event: K,
    options?: TaskListenerOptions | undefined,
  ): StatefulPromise<EngineEventMap[K]> {
    return this.ee.once(event, options);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#connect)
   */
  @mutex
  async connect(
    endpoint: string | URL,
    options: ClientConnectOptions | undefined = {},
  ): Promise<void> {
    const conn = this.getConnectionInfo();
    endpoint = processEndpoint(endpoint);

    if (conn?.state === "open") {
      if (conn.endpoint.href === endpoint.href) {
        return;
      }

      throw new ConnectionConflictError(conn.endpoint, endpoint);
    }

    const protocol = endpoint.protocol.slice(0, -1 /* remove `:` */);
    const engine = await this.createEngine(protocol);
    const { signal = getTimeoutSignal(15_000) } = options;
    await engine.connect({ endpoint, signal });
    this.eng = engine;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#disconnect)
   */
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

      try {
        await this.eng.disconnect({ signal });
      } finally {
        await this.ee.idle(); // エラーを投げない。
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

    throw new RpcResponseError(resp, {
      cause: {
        method,
        // TODO(tai-kun): params には機微情報が含まれている可能性があるので、method のみにしておく？
        params,
      },
    });
  }
}
