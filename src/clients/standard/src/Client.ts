import { QueryFailure } from "@tai-kun/surreal/errors";
import type {
  Auth,
  LiveData,
  LiveDiff,
  LiveResult,
  Patch,
  QueryResult,
  ReadonlyPatch,
  RecordData,
  RpcResultMapping,
  ScopeAuth,
} from "@tai-kun/surreal/types";
import type { TaskListener } from "@tai-kun/surreal/utils";
import type { Table, Uuid } from "@tai-kun/surreal/values";
import type { Thing } from "@tai-kun/surreal/values";
import { Simplify } from "type-fest";
import type { ClientRpcOptions } from "../../_shared/types";
import Base from "../../tiny";

/**
 * ライブクエリーのオプション。
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
 * @template T 結果の型。
 * @param response ライブクエリーの結果。
 */
export type LiveHandler<T extends LiveResult<any, any> = LiveResult> =
  TaskListener<
    [response: T]
  >;

/**
 * ライブクエリーのの結果の型を推論します。
 *
 * @template I ライブクエリーの UUID。
 */
// dprint-ignore
export type InferLiveResult<
  I extends string | Uuid,
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends readonly Patch<unknown>[] = Patch<unknown>[]
>
  = I extends { __diff: true }  ? LiveDiff<T, P>
  : I extends { __diff: false } ? LiveData<T>
  : LiveResult<T, P>

// dprint-ignore
export type ActionResult<T extends RecordData = RecordData>
  = "id" extends keyof T ? T
  : Simplify<T & { readonly id: string | Thing }>;

/**
 * パッチ操作のオプション。
 */
export interface PatchOptions extends ClientRpcOptions {
  /**
   * 差分で取得するかどうか。
   */
  readonly diff?: boolean | null | undefined;
}

export interface RunOptions extends ClientRpcOptions {
  readonly version?: string | null | undefined;
}

export default class Client extends Base {
  /**
   * SurrealDB に Ping を送信します。
   *
   * @param options RPC 呼び出しのオプション。
   */
  async ping(options?: ClientRpcOptions | undefined): Promise<void> {
    await this.rpc("ping", [], options);
  }

  /**
   * 特定の名前空間に切り替える。
   *
   * @param ns 切り替える名前空間。
   * @param options RPC 呼び出しのオプション。
   */
  async use(
    ns: string | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  /**
   * 特定の名前空間とデータベースに切り替える。
   *
   * @param ns 切り替える名前空間。
   * @param db 切り替えるデータベース。
   * @param options RPC 呼び出しのオプション。
   */
  async use(
    ns: string | null | undefined,
    db?: string | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  /**
   * 特定の名前空間とデータベースに切り替える。
   *
   * @param target 切り替える名前空間とデータベース。
   * @param options RPC 呼び出しのオプション。
   */
  async use(
    target: [ns: string | null | undefined, db?: string | null | undefined],
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  /**
   * 特定の名前空間とデータベースに切り替える。
   *
   * @param target 切り替える名前空間とデータベース。
   * @param options RPC 呼び出しのオプション。
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
   * @param target 切り替える名前空間とデータベース。
   * @param options RPC 呼び出しのオプション。
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
   * @template T RPC の結果の型。
   * @param options RPC 呼び出しのオプション。
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
   * @template T RPC の結果の型。
   * @param auth 認証情報。
   * @param options RPC 呼び出しのオプション。
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
   * @template T RPC の結果の型。
   * @param auth 認証情報。
   * @param options RPC 呼び出しのオプション。
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
   * @param token トークン。
   * @param options RPC 呼び出しのオプション。
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
   * @param options RPC 呼び出しのオプション。
   */
  async invalidate(
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("invalidate", [], options);
  }

  /**
   * ライブクエリーを開始します。
   *
   * @template T RPC の結果の型。
   * @param table 対象のテーブル。
   * @param options RPC 呼び出しのオプション。
   * @returns ライブクエリーの UUID。
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | Table,
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<T & { __diff: true }>;

  /**
   * ライブクエリーを開始します。
   *
   * @template T RPC の結果の型。
   * @param table 対象のテーブル。
   * @param options RPC 呼び出しのオプション。
   * @returns ライブクエリーの UUID。
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | Table,
    options?:
      | (ClientRpcOptions & { readonly diff?: false | null | undefined })
      | undefined,
  ): Promise<T & { __diff: false }>;

  /**
   * ライブクエリーを開始します。
   *
   * @template T RPC の結果の型。
   * @param table 対象のテーブル。
   * @param options RPC 呼び出しのオプション。
   * @returns ライブクエリーの UUID。
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | Table,
    options?: LiveOptions | undefined,
  ): Promise<T & { __diff: boolean }>;

  // TODO(tai-kun): バッファリングオプションを追加します。
  async live(
    table: string | Table,
    options: LiveOptions | undefined = {},
  ) {
    const { diff, ...rest } = options;
    const queryUuid = await this.rpc("live", [table, diff], rest);

    return queryUuid;
  }

  /**
   * ライブクエリーの結果を購読します。
   *
   * @template I ライブクエリーの UUID。
   * @template T ライブクエリーの結果の型。
   * @param queryUuid ライブクエリーの UUID。
   * @param callback ライブクエリーの結果を受け取るコールバック。
   */
  subscribe<
    I extends string | Uuid,
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
   * @param queryUuid ライブクエリーの UUID。
   * @param callback ライブクエリーの結果を受け取るコールバック。
   */
  unsubscribe(
    queryUuid: string | Uuid,
    callback: LiveHandler<any>,
  ): void {
    this.ee.off(`live/${queryUuid}`, callback);
  }

  /**
   * 実行中のライブクエリーを停止します。
   *
   * @param queryUuid ライブクエリーの UUID。
   * @param options RPC 呼び出しのオプション。
   */
  async kill(
    queryUuid: string | Uuid | readonly (string | Uuid)[],
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
   * @template T RPC の結果の型。
   * @param surql SurrealQL。
   * @param vars SurrealQL の変数。
   * @param options RPC 呼び出しのオプション。
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
   * @template T RPC の結果の型。
   * @param surql SurrealQL。
   * @param vars SurrealQL の変数。
   * @param options RPC 呼び出しのオプション。
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
   * @template T RPC の結果の型。
   * @param surql SurrealQL。
   * @param vars SurrealQL の変数。
   * @param options RPC 呼び出しのオプション。
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

  /**
   * 現在の接続における変数を定義します。
   *
   * @param name 変数名。
   * @param value 変数の値。
   * @param options RPC 呼び出しのオプション。
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
   * @param name 変数名
   * @param options RPC 呼び出しのオプション。
   */
  async unset(
    name: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("unset", [name], options);
  }

  /**
   * テーブル内のすべてのレコードまたは単一のレコードを SELECT します。
   *
   * @template T 結果の型。
   * @param thing 選択するレコードのテーブル名。
   * @param options RPC 呼び出しのオプション。
   * @returns 選択されたレコード。
   */
  async select<T extends RecordData = RecordData>(
    thing: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * テーブル内のすべてのレコードまたは単一のレコードを SELECT します。
   *
   * @template T 結果の型。
   * @param thing 選択するレコードの ID。
   * @param options RPC 呼び出しのオプション。
   * @returns 選択されたレコード。
   */
  async select<T extends RecordData = RecordData>(
    thing: Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async select(
    thing: string | Thing,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("select", [thing], options);
  }

  /**
   * テーブル内のすべてのレコードまたは単一のレコードを SELECT します。
   *
   * @template T 結果の型。
   * @template U 作成するレコードの型。
   * @param thing 作成するレコードのテーブル名。
   * @param data 作成するデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns 作成されたレコード。
   */
  async create<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * レコードを作成します。
   *
   * @template T 結果の型。
   * @template U 作成するレコードの型。
   * @param thing 作成するレコードの ID。
   * @param data 作成するデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns 作成されたレコード。
   */
  async create<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: Thing,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async create(
    thing: string | Thing,
    data?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("create", [thing, data], options);
  }

  /**
   * 複数または単一のレコードを挿入します。
   *
   * @template T 結果の型。
   * @template U 挿入するデータの型。
   * @param thing 挿入するレコードのテーブル名。
   * @param data 挿入するデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns 挿入されたレコード。
   */
  async insert<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data?: U | readonly U[] | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * レコードを挿入します。
   *
   * @template T 結果の型。
   * @template U 挿入するデータの型。
   * @param thing 挿入するレコードの ID。
   * @param data The data to insert.
   * @param options RPC 呼び出しのオプション。
   * @returns 挿入されたレコード。
   */
  async insert<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: Thing,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async insert(
    thing: string | Thing,
    data?: RecordData | readonly RecordData[] | null | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("insert", [thing, data], options);
  }

  /**
   * 複数または単一のレコードを更新します。
   *
   * @template T 結果の型。
   * @template U 更新するデータの型。
   * @param thing 更新するレコードのテーブル名。
   * @param data 更新するデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns 更新されたレコード。
   */
  async update<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * レコードを更新します。
   *
   * @template T 結果の型。
   * @template U 更新するデータの型。
   * @param thing 更新するレコードの ID。
   * @param data 更新するデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns 更新されたレコード。
   */
  async update<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: Thing,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async update(
    thing: string | Thing,
    data?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("update", [thing, data], options);
  }

  /**
   * 複数または単一のレコードにデータをマージします。
   *
   * @template T 結果の型。
   * @template U マージするデータの型。
   * @param thing マージするレコードのテーブル名。
   * @param data マージするデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns マージされたレコード。
   */
  async merge<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data: U,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * レコードにデータをマージします。
   *
   * @template T 結果の型。
   * @template U マージするデータの型。
   * @param thing マージするレコードの ID。
   * @param data マージするデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns マージされたレコード。
   */
  async merge<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: Thing,
    data: U,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async merge(
    thing: string | Thing,
    data: RecordData,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("merge", [thing, data], options);
  }

  /**
   * 複数または単一のレコードにパッチを適用します。
   *
   * @template T 結果の型。
   * @param thing パッチを適用するレコードのテーブル名。
   * @param patches 適用するパッチ。
   * @param options RPC 呼び出しのオプション。
   * @returns パッチされたレコード。
   */
  async patch<T extends RecordData = RecordData>(
    thing: string,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | null | undefined })
      | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * レコードにパッチを適用します。
   *
   * @template T 結果の型。
   * @param thing パッチを適用するレコードの ID。
   * @param patches 適用するパッチ。
   * @param options RPC 呼び出しのオプション。
   * @returns パッチされたレコード。
   */
  async patch<T extends RecordData = RecordData>(
    thing: Thing,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | null | undefined })
      | undefined,
  ): Promise<ActionResult<T>>;

  /**
   * 複数または単一のレコードにパッチを適用します。
   *
   * @param thing パッチを適用するレコードのテーブル名。
   * @param patches 適用するパッチ。
   * @param options RPC 呼び出しのオプション。
   * @returns JSON パッチ。
   */
  async patch(
    thing: string,
    patches: readonly ReadonlyPatch[],
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<Patch[][]>;

  /**
   * レコードにパッチを適用します。
   *
   * @param thing パッチを適用するレコードの ID。
   * @param patches 適用するパッチ。
   * @param options RPC 呼び出しのオプション。
   * @returns JSON パッチ。
   */
  async patch(
    thing: Thing,
    patches: readonly ReadonlyPatch[],
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<Patch[]>;

  async patch(
    thing: string | Thing,
    patches: readonly ReadonlyPatch[],
    options?: PatchOptions | undefined,
  ) {
    const { diff, ...rest } = options || {};

    return await this.rpc("patch", [thing, patches, diff], rest);
  }

  /**
   * 複数または単一のレコードを削除します。
   *
   * @template T 結果の型。
   * @param thing 削除するレコードのテーブル名。
   * @param options RPC 呼び出しのオプション。
   * @returns 削除されたレコード。
   */
  async delete<T extends RecordData = RecordData>(
    thing: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * レコードを削除します。
   *
   * @template T 結果の型。
   * @param thing 削除するレコードの ID。
   * @param options RPC 呼び出しのオプション。
   * @returns 削除されたレコード。
   */
  async delete<T extends RecordData = RecordData>(
    thing: Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async delete(
    thing: string | Thing,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("delete", [thing], options);
  }

  /**
   * SurrealDB のバージョンを取得します。
   *
   * @param options RPC 呼び出しのオプション。
   * @returns SurrealDB のバージョン。
   */
  async version(options?: ClientRpcOptions | undefined): Promise<string> {
    return await this.rpc("version", [], options);
  }

  /**
   * カスタム関数または組み込み関数を実行します。
   *
   * @template T 結果の型。
   * @param funcName 実行する関数の名前。
   * @param options RPC 呼び出しのオプション。
   * @returns 関数の実行結果。
   */
  async run<T = unknown>(
    funcName: string,
    options?: RunOptions | undefined,
  ): Promise<T>;

  /**
   * カスタム関数または組み込み関数を実行します。
   *
   * @template T 結果の型。
   * @param funcName 実行する関数の名前。
   * @param args 関数に渡す引数。
   * @param options RPC 呼び出しのオプション。
   * @returns 関数の実行結果。
   */
  async run<T = unknown>(
    funcName: string,
    args?: readonly unknown[] | null | undefined,
    options?: RunOptions | undefined,
  ): Promise<T>;

  async run(
    funcName: string,
    arg1?: readonly unknown[] | RunOptions | null | undefined,
    arg2?: RunOptions | undefined,
  ) {
    const [args, opts] = Array.isArray(arg1) || arg1 === null
      ? [arg1, arg2] as const
      : [null, arg1] as const;
    const { version, ...rest } = opts || {};

    return await this.rpc("run", [funcName, version, args], rest);
  }

  /**
   * レコード間にグラフエッジを作成します。
   *
   * @template T 結果の型。
   * @param from ソースレコードの ID。
   * @param thing グラフエッジのレコードのテーブル名。
   * @param to ターゲットレコードの ID。
   * @param data エッジに関連付けるデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns グラフエッジ。
   */
  async relate<T extends RecordData = RecordData, U extends RecordData = T>(
    from: string | Thing | readonly Thing[],
    thing: string,
    to: string | Thing | readonly Thing[],
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T[]>;

  /**
   * レコード間にグラフエッジを作成します。
   *
   * @template T 結果の型。
   * @param from ソースレコードの ID。
   * @param thing グラフエッジのレコードの ID。
   * @param to ターゲットレコードの ID。
   * @param data エッジに関連付けるデータ。
   * @param options RPC 呼び出しのオプション。
   * @returns グラフエッジ。
   */
  async relate<T extends RecordData = RecordData, U extends RecordData = T>(
    from: string | Thing | readonly Thing[],
    thing: Thing,
    to: string | Thing | readonly Thing[],
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  async relate(
    from: string | Thing | readonly Thing[],
    thing: string | Thing,
    to: string | Thing | readonly Thing[],
    data?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("relate", [from, thing, to, data], options);
  }
}
