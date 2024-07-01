import { Simplify } from "type-fest";
import type { Patch, ReadonlyPatch, RecordData } from "~/index/types";
import type { ThingType } from "~/index/values";
import type { ClientRpcOptions } from "../../_client/Abc";
import Base from "../../standard/client/Client";

// dprint-ignore
export type ActionResult<T extends RecordData = RecordData>
  = "id" extends keyof T ? T
  : Simplify<T & { readonly id: string | ThingType }>;

export interface PatchOptions extends ClientRpcOptions {
  readonly diff?: boolean | null | undefined;
}

export interface RunOptions extends ClientRpcOptions {
  readonly version?: string | null | undefined;
}

export default class Client extends Base {
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
    thing: ThingType,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async select(
    thing: string | ThingType,
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
    thing: ThingType,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async create(
    thing: string | ThingType,
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
    thing: ThingType,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async insert(
    thing: string | ThingType,
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
    thing: ThingType,
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async update(
    thing: string | ThingType,
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
    thing: ThingType,
    data: U,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async merge(
    thing: string | ThingType,
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
    thing: ThingType,
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
    thing: ThingType,
    patches: readonly ReadonlyPatch[],
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<Patch[]>;

  async patch(
    thing: string | ThingType,
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
    thing: ThingType,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async delete(
    thing: string | ThingType,
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
    from: string | ThingType | readonly ThingType[],
    thing: string,
    to: string | ThingType | readonly ThingType[],
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
    from: string | ThingType | readonly ThingType[],
    thing: ThingType,
    to: string | ThingType | readonly ThingType[],
    data?: U | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  async relate(
    from: string | ThingType | readonly ThingType[],
    thing: string | ThingType,
    to: string | ThingType | readonly ThingType[],
    data?: RecordData | null | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("relate", [from, thing, to, data], options);
  }
}
