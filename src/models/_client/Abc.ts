import type { Constructor, Promisable } from "type-fest";
import {
  type Err,
  type Ok,
  type StatefulPromise,
  TaskEmitter,
  type TaskListener,
  type TaskListenerOptions,
} from "~/_internal";
import {
  CLOSED,
  type Connection,
  type ConnectionState,
  type EngineAbc,
  type EngineConfig,
  type EngineEvents,
} from "~/engines";
import {
  type AggregateTasksError,
  CircularEngineReference,
  SurrealDbTypeError,
  UnsupportedProtocol,
} from "~/errors";
import type { FormatterAbc } from "~/formatters";
import type { RpcMethod, RpcParams, RpcResult } from "~/index/types";
import type { ValidatorAbc } from "~/validators";

/**
 * クライアントエンジンを作成する関数。
 */
export interface CreateEngine {
  /**
   * クライアントエンジンを作成します。
   *
   * @param config - エンジンの設定。
   * @returns クライアントエンジン。
   */
  (config: EngineConfig): Promisable<EngineAbc>;
}

/**
 * クライアントエンジンのマッピング。
 *
 * エンジンのプロトコルをキーとし、エンジンを作成する関数またはエンジンのプロトコルを値とします。
 * プロトコルは例えば `http` や `ws` など `://` の前にくる文字列です。
 */
export type ClientEngines = {
  readonly [P in string]?: CreateEngine | string | undefined;
};

/**
 * クライアントの設定。
 */
export interface ClientConfig {
  /**
   * クライアントエンジンのマッピング。
   */
  readonly engines: ClientEngines;
  /**
   * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザー。
   */
  readonly Formatter: Constructor<
    FormatterAbc,
    ConstructorParameters<typeof FormatterAbc>
  >;
  /**
   * 各種データの検証を行うバリデータ-。
   */
  readonly Validator: Constructor<
    ValidatorAbc,
    ConstructorParameters<typeof ValidatorAbc>
  >;
}

/**
 * クライアントの接続オプション。
 */
export interface ClientConnectOptions {
  /**
   * 接続の中断に使用するシグナル。
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * サーバーとの接続を切断する際のオプション。
 */
export interface ClientDisconnectOptions {
  /**
   * サーバーとの接続を強制的に切断するかどうか。
   * true にすると、実行中のタスクに対して中止シグナルが送信されます。
   */
  readonly force?: boolean | undefined;
  /**
   * 切断の中断に使用するシグナル。
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * RPC リクエストのオプション。
 */
export interface ClientRpcOptions {
  /**
   * リクエストの中断に使用するシグナル。
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * クライアントの抽象クラス。
 */
export default abstract class ClientAbc {
  /**
   * イベントエミッター。
   */
  protected ee: TaskEmitter<EngineEvents> = new TaskEmitter();

  /**
   * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザー。
   */
  protected fmt: FormatterAbc;

  /**
   * 各種データの検証を行うバリデータ-。
   */
  protected v8n: ValidatorAbc;

  /**
   * クライアントエンジン。
   */
  protected conn: EngineAbc | null = null;

  #engines: ClientEngines;

  /**
   * @param config - クライアントの設定。
   */
  constructor(config: ClientConfig) {
    const {
      engines,
      Formatter,
      Validator,
    } = config;
    this.fmt = new Formatter();
    this.v8n = new Validator();
    this.#engines = { ...engines }; // Shallow copy
  }

  /**
   * クライアントエンジンを作成します。
   *
   * @param protocol - 接続を試みるエンドポイントのプロトコル。
   * @returns クライアントエンジン。
   * @example
   * ```ts
   * const url = new URL(endpoint);
   * const protocol = url.protocol.replace(/:$/, "");
   * const engine = await this.createEngine(protocol);
   * ```
   */
  protected async createEngine(protocol: string): Promise<EngineAbc> {
    let engine = this.#engines[protocol];
    const seen: string[] = [];

    while (typeof engine === "string") {
      if (seen.includes(engine)) {
        throw new CircularEngineReference(seen);
      }

      seen.push(engine);
      engine = this.#engines[engine];
    }

    if (!engine) {
      throw new UnsupportedProtocol(protocol);
    }

    return await engine({
      emitter: this.ee,
      formatter: this.fmt,
      validator: this.v8n,
    });
  }

  /**
   * 現在の接続状態。
   */
  get state(): ConnectionState {
    return this.conn?.state ?? CLOSED;
  }

  /**
   * 現在の接続情報。
   */
  get connection(): Connection | null {
    return this.conn?.connection || null;
  }

  /**
   * イベントリスナーを追加します。
   *
   * @template K - イベントの型。
   * @param event - リスナーを追加するイベント。
   * @param listener - 追加するリスナー。
   * @example
   * ```ts
   * import { OPEN } from "@tai-kun/surreal/engines";
   *
   * const db = (省略);
   * db.on(OPEN, () => {
   *   console.log("接続が確立されました。");
   * });
   */
  on<K extends keyof EngineEvents>(
    event: K,
    listener: TaskListener<EngineEvents[K]>,
  ): void {
    this.ee.on(event, listener);
  }

  /**
   * イベントリスナーを削除します。
   *
   * @template K - イベントの型。
   * @param event - リスナーを削除するイベント。
   * @param listener - 削除するリスナー。
   * @example
   * ```ts
   * import { CLOSED } from "@tai-kun/surreal/engines";
   *
   * const db = (省略);
   * const listener = () => {
   *   console.log("切断されました。");
   * };
   * db.on(CLOSED, listener);
   * db.off(CLOSED, listener);
   * ```
   */
  off<K extends keyof EngineEvents>(
    event: K,
    listener: TaskListener<EngineEvents[K]>,
  ): void {
    // 誤ってすべてのイベントリスナーを解除してしまわないようにするため、
    // listener が無い場合はエラーを投げる。
    if (!listener) {
      throw new SurrealDbTypeError(
        `Expected listener to be a function, but got ${typeof listener} instead.`,
      );
    }

    this.ee.off(event, listener);
  }

  /**
   * イベントを待機します。
   *
   * @template K - イベントの型。
   * @param event - 待機するイベント。
   * @param options - タスクリスナーのオプション。
   * @returns イベントリスナーに渡された引数。
   * @example
   * ```ts
   * import { OPEN } from "@tai-kun/surreal/engines";
   *
   * const db = (省略);
   * const promise = db.once(OPEN);
   * db.connect("https://localhost:8000");
   * await promise;
   * console.log("接続が確立されました。");
   * ```
   */
  once<K extends keyof EngineEvents>(
    event: K,
    options?: TaskListenerOptions | undefined,
  ): StatefulPromise<EngineEvents[K]> {
    return this.ee.once(event, options);
  }

  /**
   * 指定されたエンドポイントに接続します。
   *
   * @param endpoint - 接続先のエンドポイント。
   * @param options - 接続のオプション。
   * @example
   * ```ts
   * const db = (省略);
   * await db.connect("https://localhost:8000");
   * ```
   */
  abstract connect(
    endpoint: string | URL,
    options?: ClientConnectOptions | undefined,
  ): Promise<void>;

  /**
   * サーバーとの接続を切断します。
   *
   * @param options - 切断のオプション。
   * @returns　切断の結果。
   * @example
   * ```ts
   * const db = (省略);
   * await db.connect("https://localhost:8000");
   * const result = await db.disconnect();
   *
   * if (result.ok) {
   *   console.log(`正常に切断されました: ${result.value}`);
   * } else {
   *   if ("disconnect" in result.error) {
   *      console.error("切断に失敗しました:", result.error.disconnect);
   *   }
   *
   *   if ("dispose" in result.error) {
   *      console.error("タスクの終了に失敗しました:", result.error.dispose);
   *   }
   * }
   */
  abstract disconnect(options?: ClientDisconnectOptions | undefined): Promise<
    | Ok
    | Ok<"AlreadyDisconnected">
    | Err<{
      disconnect?: unknown;
      dispose?: AggregateTasksError;
    }>
  >;

  /**
   * サーバーに RPC リクエストを送信します。
   *
   * @template M - RPC メソッドの型。
   * @param method - RPC メソッド。
   * @param params - RPC メソッドのパラメータ。
   * @param options - リクエストのオプション。
   * @returns RPC の結果。
   * @example
   * ```ts
   * const db = (省略);
   * await db.connect("https://localhost:8000");
   *
   * const result = await db.rpc("ping", []);
   * console.log(result);
   *
   * await db.disconnect();
   * ```
   */
  abstract rpc<M extends RpcMethod, T extends RpcResult<M>>(
    method: M,
    params: RpcParams<M>,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;
}
