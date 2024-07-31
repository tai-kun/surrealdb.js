import type {
  ConnectionInfo,
  ConnectionState,
  EngineAbc,
  EngineAbcConfig,
  EngineEvents,
} from "@tai-kun/surrealdb/engine";
import {
  CircularEngineReferenceError,
  EngineNotFoundError,
  SurrealTypeError,
} from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import type { RpcMethod, RpcParams, RpcResult } from "@tai-kun/surrealdb/types";
import {
  type StatefulPromise,
  TaskEmitter,
  type TaskListener,
  type TaskListenerOptions,
} from "@tai-kun/surrealdb/utils";
import type { Validator } from "@tai-kun/surrealdb/validator";

export type CreateEngine = (config: EngineAbcConfig) =>
  | EngineAbc
  | PromiseLike<EngineAbc>;

export type ClientEngines = {
  readonly [_ in string]?: CreateEngine | string | undefined;
};

export interface ClientAbcConfig {
  readonly engines: ClientEngines;
  readonly formatter: Formatter;
  readonly validator: Validator;
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

export default abstract class ClientAbc {
  protected ee: TaskEmitter<EngineEvents> = new TaskEmitter();
  protected fmt: Formatter;
  protected v8n: Validator;
  protected eng: EngineAbc | null = null;

  private readonly _engines: ClientEngines;

  constructor(config: ClientAbcConfig) {
    const {
      engines,
      formatter,
      validator,
    } = config;
    this.fmt = formatter;
    this.v8n = validator;
    this._engines = { ...engines }; // Shallow copy
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
      validator: this.v8n,
    });
  }

  get state(): ConnectionState | undefined {
    return this.eng?.state;
  }

  get endpoint(): URL | null | undefined {
    return this.eng?.endpoint;
  }

  get namespace(): string | null | undefined {
    return this.eng?.namespace;
  }

  set namespace(ns: string | null) {
    if (this.eng) {
      this.eng.namespace = ns;
    }
  }

  get database(): string | null | undefined {
    return this.eng?.database;
  }

  set database(db: string | null) {
    if (this.eng) {
      this.eng.database = db;
    }
  }

  get token(): string | null | undefined {
    return this.eng?.token;
  }

  set token(token: string | null) {
    if (this.eng) {
      this.eng.token = token;
    }
  }

  getConnectionInfo(): ConnectionInfo | undefined {
    return this.eng?.getConnectionInfo();
  }

  on<K extends keyof EngineEvents>(
    event: K,
    listener: TaskListener<EngineEvents[K]>,
  ): void {
    this.ee.on(event, listener);
  }

  off<K extends keyof EngineEvents>(
    event: K,
    listener: TaskListener<EngineEvents[K]>,
  ): void {
    // 誤ってすべてのイベントリスナーを解除してしまわないようにするため、
    // listener が無い場合はエラーを投げる。
    if (typeof listener !== "function") {
      throw new SurrealTypeError("function", typeof listener);
    }

    this.ee.off(event, listener);
  }

  once<K extends keyof EngineEvents>(
    event: K,
    options?: TaskListenerOptions | undefined,
  ): StatefulPromise<EngineEvents[K]> {
    return this.ee.once(event, options);
  }

  abstract connect(
    endpoint: string | URL,
    options?: ClientConnectOptions | undefined,
  ): Promise<void>;

  abstract disconnect(
    options?: ClientDisconnectOptions | undefined,
  ): Promise<void>;

  abstract rpc<M extends RpcMethod, T extends RpcResult<M>>(
    method: M,
    params: RpcParams<M>,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;
}
