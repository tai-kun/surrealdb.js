import type { TaskListener } from "~/_internal";
import { QueryFailure } from "~/errors";
import type {
  Auth,
  LiveData,
  LiveDiff,
  LiveResult,
  Patch,
  QueryResult,
  RecordData,
  RpcResultMapping,
  ScopeAuth,
} from "~/index/types";
import type { TableType, UuidType } from "~/index/values";
import type { ClientRpcOptions } from "../../_client/Abc";
import Base from "../../tiny/client/Client";

/**
 * ライブクラリーのオプション。
 */
export interface LiveOptions extends ClientRpcOptions {
  /**
   * 差分で取得するかどうか。
   */
  readonly diff?: boolean | null | undefined;
}

/**
 * ライブクエリーのイベントハンドラー。
 *
 * @template T - 結果の型。
 * @param response - ライブクエリーの結果。
 */
export type LiveHandler<T extends LiveResult<any, any> = LiveResult> =
  TaskListener<
    [response: T]
  >;

/**
 * ライブクエリーのの結果の型を推論します。
 *
 * @template I - ライブクエリーの UUID。
 */
// dprint-ignore
export type InferLiveResult<
  I extends string | UuidType,
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends readonly Patch<unknown>[] = Patch<unknown>[]
>
  = I extends { __diff: true }  ? LiveDiff<T, P>
  : I extends { __diff: false } ? LiveData<T>
  : LiveResult<T, P>

export default class Client extends Base {
  /**
   * SurrealDB に Ping を送信します。
   *
   * @param options - RPC 呼び出しのオプション。
   */
  async ping(options?: ClientRpcOptions | undefined): Promise<void> {
    await this.rpc("ping", [], options);
  }

  /**
   * 特定の名前空間に切り替える。
   *
   * @param ns - 切り替える名前空間。
   * @param options - RPC 呼び出しのオプション。
   */
  async use(
    ns: string | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  /**
   * 特定の名前空間とデータベースに切り替える。
   *
   * @param ns - 切り替える名前空間。
   * @param db - 切り替えるデータベース。
   * @param options - RPC 呼び出しのオプション。
   */
  async use(
    ns: string | null | undefined,
    db?: string | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  /**
   * 特定の名前空間とデータベースに切り替える。
   *
   * @param target - 切り替える名前空間とデータベース。
   * @param options - RPC 呼び出しのオプション。
   */
  async use(
    target: [ns: string | null | undefined, db?: string | null | undefined],
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  /**
   * 特定の名前空間とデータベースに切り替える。
   *
   * @param target - 切り替える名前空間とデータベース。
   * @param options - RPC 呼び出しのオプション。
   */
  async use(
    target: {
      readonly ns?: string | null | undefined;
      readonly db?: string | null | undefined;
    },
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  /**
   * 特定の名前空間とデータベースに切り替える。
   *
   * @param target - 切り替える名前空間とデータベース。
   * @param options - RPC 呼び出しのオプション。
   */
  async use(
    target: {
      readonly namespace?: string | null | undefined;
      readonly database?: string | null | undefined;
    },
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  async use(
    ...args:
      | [
        string | null | undefined,
        (ClientRpcOptions | undefined)?,
      ]
      | [
        string | null | undefined,
        (string | null | undefined)?,
        (ClientRpcOptions | undefined)?,
      ]
      | [
        [string | null | undefined, (string | null | undefined)?],
        (ClientRpcOptions | undefined)?,
      ]
      | [
        {
          readonly ns?: string | null | undefined;
          readonly db?: string | null | undefined;
        },
        (ClientRpcOptions | undefined)?,
      ]
      | [
        {
          readonly namespace?: string | null | undefined;
          readonly database?: string | null | undefined;
        },
        (ClientRpcOptions | undefined)?,
      ]
  ): Promise<void> {
    let namespace: string | null | undefined;
    let database: string | null | undefined;
    let options: ClientRpcOptions | undefined;

    if (typeof args[0] === "string" || args[0] == null) {
      const [ns, arg1, arg2] = args;
      const [db, opts] = typeof arg1 === "string"
        ? [arg1, arg2]
        : [null, arg1 || arg2];
      namespace = ns;
      database = db;
      options = opts;
    } else if (Array.isArray(args[0])) {
      const [[ns, db], opts] = args;
      namespace = ns;
      database = db;
      options = opts as ClientRpcOptions | undefined;
    } else if ("ns" in args[0] || "db" in args[0]) {
      const [{ ns, db }, opts] = args;
      namespace = ns;
      database = db;
      options = opts as ClientRpcOptions | undefined;
    } else if ("namespace" in args[0] || "database" in args[0]) {
      const [{ namespace: ns, database: db }, opts] = args;
      namespace = ns;
      database = db;
      options = opts as ClientRpcOptions | undefined;
    }

    await this.rpc("use", [namespace, database], options);
  }

  /**
   * `$auth` 変数からすべて SELECT します。
   *
   * ```sql
   * SELECT * FROM $auth;
   * ```
   *
   * @template T - RPC の結果の型。
   * @param options - RPC 呼び出しのオプション。
   * @returns `$auth` 変数の内容。
   */
  async info<T extends RpcResultMapping["info"] = RpcResultMapping["info"]>(
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("info", [], options);
  }

  /**
   * スコープユーザーを登録します。
   *
   * @template T - RPC の結果の型。
   * @param auth - 認証情報。
   * @param options - RPC 呼び出しのオプション。
   * @returns JSON Web Token。
   */
  async signup<
    T extends RpcResultMapping["signup"] = RpcResultMapping["signup"],
  >(
    auth: ScopeAuth,
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("signup", [auth], options);
  }

  /**
   * ルート、名前空間、データベース、またはスコープユーザーで SurrealDB にサインインします。
   *
   * @template T - RPC の結果の型。
   * @param auth - 認証情報。
   * @param options - RPC 呼び出しのオプション。
   * @returns JSON Web Token。
   */
  async signin<
    T extends RpcResultMapping["signin"] = RpcResultMapping["signin"],
  >(
    auth: Auth,
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("signin", [auth], options);
  }

  /**
   * トークンで SurrealDB にサインインします。
   *
   * @param token - トークン。
   * @param options - RPC 呼び出しのオプション。
   */
  async authenticate(
    token: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("authenticate", [token], options);
  }

  /**
   * 現在の接続におけるユーザーのセッションを無効化します。
   *
   * @param options - RPC 呼び出しのオプション。
   */
  async invalidate(
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("invalidate", [], options);
  }

  /**
   * 現在の接続における変数を定義します。
   *
   * @param name - 変数名。
   * @param value - 変数の値。
   * @param options - RPC 呼び出しのオプション。
   */
  async let(
    name: string,
    value: unknown,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("let", [name, value], options);
  }

  /**
   * 現在の接続における変数を削除します。
   *
   * @param name - 変数名
   * @param options - RPC 呼び出しのオプション。
   */
  async unset(
    name: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("unset", [name], options);
  }

  /**
   * ライブクエリーを開始します。
   *
   * @template T - RPC の結果の型。
   * @param table - 対象のテーブル。
   * @param options - RPC 呼び出しのオプション。
   * @returns ライブクエリーの UUID。
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | TableType,
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<T & { __diff: true }>;

  /**
   * ライブクエリーを開始します。
   *
   * @template T - RPC の結果の型。
   * @param table - 対象のテーブル。
   * @param options - RPC 呼び出しのオプション。
   * @returns ライブクエリーの UUID。
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | TableType,
    options?:
      | (ClientRpcOptions & { readonly diff?: false | null | undefined })
      | undefined,
  ): Promise<T & { __diff: false }>;

  /**
   * ライブクエリーを開始します。
   *
   * @template T - RPC の結果の型。
   * @param table - 対象のテーブル。
   * @param options - RPC 呼び出しのオプション。
   * @returns ライブクエリーの UUID。
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | TableType,
    options?:
      | (ClientRpcOptions & { readonly diff?: boolean | null | undefined })
      | undefined,
  ): Promise<T & { __diff: boolean }>;

  // TODO(tai-kun): バッファリングオプションを追加します。
  async live(
    table: string | TableType,
    options:
      | (ClientRpcOptions & { readonly diff?: boolean | null | undefined })
      | undefined = {},
  ) {
    const { diff, ...rest } = options;
    const queryUuid = await this.rpc("live", [table, diff], rest);

    return queryUuid;
  }

  /**
   * ライブクエリーの結果を購読します。
   *
   * @template I - ライブクエリーの UUID。
   * @template T - ライブクエリーの結果の型。
   * @param queryUuid - ライブクエリーの UUID。
   * @param callback - ライブクエリーの結果を受け取るコールバック。
   */
  subscribe<
    I extends string | UuidType,
    T extends InferLiveResult<I, any, any> = InferLiveResult<I>,
  >(
    queryUuid: I,
    callback: LiveHandler<T>,
  ): void {
    this.ee.on(`live/${queryUuid}`, callback as LiveHandler<any>);
  }

  /**
   * ライブクエリーの結果の購読を解除します。
   *
   * @param queryUuid - ライブクエリーの UUID。
   * @param callback - ライブクエリーの結果を受け取るコールバック。
   */
  unsubscribe(
    queryUuid: string | UuidType,
    callback: LiveHandler<any>,
  ): void {
    this.ee.off(`live/${queryUuid}`, callback);
  }

  /**
   * 実行中のライブクエリーを停止します。
   *
   * @param queryUuid - ライブクエリーの UUID。
   * @param options - RPC 呼び出しのオプション。
   */
  async kill(
    queryUuid: string | UuidType | readonly (string | UuidType)[],
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    if (Array.isArray(queryUuid)) {
      await Promise.all(queryUuid.map(async uuid => {
        await this.kill(uuid, options);
      }));
    } else {
      this.ee.off(`live/${queryUuid}`);
      await this.rpc("kill", [queryUuid], options);
    }
  }

  /**
   * SurrealQL でカスタムクエリーを実行します。
   *
   * @template T - RPC の結果の型。
   * @param surql - SurrealQL。
   * @param vars - SurrealQL の変数。
   * @param options - RPC 呼び出しのオプション。
   * @returns クエリーの結果。
   */
  async queryRaw<T extends readonly QueryResult[] = QueryResult[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
    },
    vars?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    const results: readonly QueryResult[] = await this.rpc(
      "query",
      [surql, vars],
      options,
    );

    return results as T;
  }

  /**
   * SurrealQL でカスタムクエリーを実行します。
   *
   * @template T - RPC の結果の型。
   * @param surql - SurrealQL。
   * @param vars - SurrealQL の変数。
   * @param options - RPC 呼び出しのオプション。
   * @returns クエリーの結果。
   */
  async query<T extends readonly unknown[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
      readonly __type: T;
    },
    vars?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  /**
   * SurrealQL でカスタムクエリーを実行します。
   *
   * @template T - RPC の結果の型。
   * @param surql - SurrealQL。
   * @param vars - SurrealQL の変数。
   * @param options - RPC 呼び出しのオプション。
   * @returns クエリーの結果。
   */
  async query<T extends readonly unknown[] = unknown[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
    },
    vars?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  async query(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
    },
    vars?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<unknown[]> {
    const results = await this.queryRaw(surql, vars, options);
    const output: unknown[] = [];
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === "OK") {
        output.push(result.result);
      } else {
        errors.push(result.result);
      }
    }

    if (errors.length > 0) {
      throw new QueryFailure(errors);
    }

    return output;
  }
}
