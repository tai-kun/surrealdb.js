declare module "@tools/test" {
  type TestFn = () => void | Promise<void>;

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
  export declare function test(name: string, fn: TestFn): unknown;

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
    fn: TestFn,
  ): unknown;
}
