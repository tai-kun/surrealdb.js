declare module "@tools/test" {
  type Fn = () => void | Promise<void>;

  type TestOptions = {
    /**
     * テストケースをスキップするかどうか。
     * 真値であれば、テストはスキップされます。
     * 文字列が指定されている場合、その文字列はテストをスキップする理由としてテスト結果に表示されます。
     *
     * @default false
     */
    readonly skip?: boolean | string | undefined;
    /**
     * テストケースのタイムアウト (ミリ秒)。
     *
     * @default 5_000
     */
    readonly timeout?: number | undefined;
  };

  type HookOptions = {
    /**
     * テストケースのタイムアウト (ミリ秒)。
     *
     * @default 5_000
     */
    readonly timeout?: number | undefined;
  };

  type SuiteOptions = {
    /**
     * テストケースをスキップするかどうか。
     * 真値であれば、テストはスキップされます。
     * 文字列が指定されている場合、その文字列はテストをスキップする理由としてテスト結果に表示されます。
     *
     * @default false
     */
    readonly skip?: boolean | string | undefined;
  };

  /**
   * テストが実行されている環境。
   */
  export declare const ENV:
    // JavaScript/TypeScript runtimes
    | "Bun"
    | "Deno"
    | "Node"
    // Browsers
    | "Chrome"
    | "Firefox"
    | "WebKit";

  /**
   * 指定された名前と関数を使用してテスト ケースを定義します。
   *
   * @param name テストケースの名前。
   * @param fn テストケースを実装する関数。
   */
  export declare function test(name: string, fn: Fn): unknown;

  /**
   * 指定された名前とオプション、関数を使用してテスト ケースを定義します。
   *
   * @param name テストケースの名前。
   * @param options テストケースのオプション。
   * @param fn テストケースを実装する関数。
   */
  export declare function test(
    name: string,
    options: TestOptions,
    fn: Fn,
  ): unknown;

  /**
   * テスト実行前に共通の前処理を実行する。
   *
   * @param fn 前処理を実行する関数。
   */
  export declare function after(fn: Fn): unknown;

  /**
   * テスト実行前に共通の前処理を実行する。
   *
   * @param options フックのオプション。
   * @param fn 前処理を実行する関数。
   */
  export declare function after(options: HookOptions, fn: Fn): unknown;

  /**
   * テスト実行後に共通の後処理を実行する。
   *
   * @param fn 後処理を実行する関数。
   */
  export declare function before(fn: Fn): unknown;

  /**
   * テスト実行後に共通の後処理を実行する。
   *
   * @param options フックのオプション。
   * @param fn 後処理を実行する関数。
   */
  export declare function before(options: HookOptions, fn: Fn): unknown;

  /**
   * テストケースをグルーピングする。
   *
   * @param name テストの結果に表示されるテストスイートの名前。
   * @param fn テストケースを宣言する関数。
   */
  export declare function describe(name: string, fn: () => void): unknown;

  /**
   * テストケースをグルーピングする。
   *
   * @param name テストの結果に表示されるテストスイートの名前。
   * @param options オプション。
   * @param fn テストケースを宣言する関数。
   */
  export declare function describe(
    name: string,
    options: SuiteOptions,
    fn: () => void,
  ): unknown;
}
