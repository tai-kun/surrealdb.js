import type { Constructor, Promisable } from "type-fest";
import {
  CLOSED,
  type Connection,
  type ConnectionState,
  type EngineAbc,
  type EngineEvents,
} from "../engines";
import {
  type AggregateTasksError,
  CircularEngineReference,
  TypeError,
  UnsupportedProtocol,
} from "../errors";
import type { FormatterAbc } from "../formatters";
import {
  type Err,
  type Ok,
  type StatefulPromise,
  TaskEmitter,
  type TaskListener,
  type TaskListenerOptions,
} from "../internal";
import type { RpcMethod, RpcParams, RpcResult } from "../types";
import type { ValidatorAbc } from "../validators";

/**
 * クライアントエンジンを作成する関数。
 */
export interface CreateEngine {
  /**
   * クライアントエンジンを作成する。
   *
   * @param config - エンジンの設定。
   * @returns クライアントエンジン。
   */
  (...args: ConstructorParameters<typeof EngineAbc>): Promisable<EngineAbc>;
}

/**
 * クライアントエンジンのマッピング。
 *
 * エンジンのプロトコルをキーとし、エンジンを作成する関数またはエンジンのプロトコルを値とする。
 * プロトコルは例えば `http` や `ws` など `://` の前にくる文字列である。
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
 * サーバーとの接続を切断する際のオプション。
 */
export interface ClientDisconnectOptions {
  /**
   * サーバーとの接続を強制的に切断するかどうか。
   * true にすると、実行中のタスクに対して中止シグナルが送信されます。
   */
  readonly force?: boolean | undefined;
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
   * クライアントエンジンを作成する。
   *
   * @param protocol - 接続を試みるエンドポイントのプロトコル。
   * @returns クライアントエンジン。
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
   */
  off<K extends keyof EngineEvents>(
    event: K,
    listener: TaskListener<EngineEvents[K]>,
  ): void {
    // 誤ってすべてのイベントリスナーを解除してしまわないようにするため、
    // listener が無い場合はエラーを投げる。
    if (!listener) {
      throw new TypeError(
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
   */
  abstract connect(endpoint: string | URL): Promise<void>;

  /**
   * サーバーとの接続を切断します。
   *
   * @returns　切断の結果。
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
   */
  abstract rpc<M extends RpcMethod, T extends RpcResult<M>>(
    method: M,
    params: RpcParams<M>,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;
}
