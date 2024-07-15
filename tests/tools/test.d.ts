declare module "@tools/test" {
  type Fn = () => void | Promise<void>;

  interface Abortable {
    /**
     * テストケースのタイムアウト (ミリ秒)。
     *
     * @default 5_000
     */
    readonly timeout?: number | undefined;
  }

  interface Skipable {
    /**
     * テストケースをスキップするかどうか。
     * 真値であれば、テストはスキップされます。
     * 文字列が指定されている場合、その文字列はテストをスキップする理由としてテスト結果に表示されます。
     *
     * @default false
     */
    readonly skip?: boolean | string | undefined;
  }

  interface TestOptions extends Abortable, Skipable {}

  interface HookOptions extends Abortable {}

  interface SuiteOptions extends Skipable {}

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
   * 最初のテストの前に 1 回だけ実行する処理を宣言します。
   *
   * @param fn 前処理を実行する関数。
   */
  export declare function beforeAll(fn: Fn): unknown;

  /**
   * 最初のテストの前に 1 回だけ実行する処理を宣言します。。
   *
   * @param options フックのオプション。
   * @param fn 前処理を実行する関数。
   */
  export declare function beforeAll(options: HookOptions, fn: Fn): unknown;

  /**
   * 各のテストの前に実行する処理を宣言します。
   *
   * @param fn 前処理を実行する関数。
   */
  export declare function beforeEach(fn: Fn): unknown;

  /**
   * 各のテストの前に実行する処理を宣言します。
   *
   * @param options フックのオプション。
   * @param fn 前処理を実行する関数。
   */
  export declare function beforeEach(options: HookOptions, fn: Fn): unknown;

  /**
   * 最初のテストの後に 1 回だけ実行する処理を宣言します。
   *
   * @param fn 後処理を実行する関数。
   */
  export declare function afterAll(fn: Fn): unknown;

  /**
   * 最初のテストの後に 1 回だけ実行する処理を宣言します。
   *
   * @param options フックのオプション。
   * @param fn 後処理を実行する関数。
   */
  export declare function afterAll(options: HookOptions, fn: Fn): unknown;

  /**
   * 各のテストの後に実行する処理を宣言します。
   *
   * @param fn 後処理を実行する関数。
   */
  export declare function afterEach(fn: Fn): unknown;

  /**
   * 各のテストの後に実行する処理を宣言します。
   *
   * @param options フックのオプション。
   * @param fn 後処理を実行する関数。
   */
  export declare function afterEach(options: HookOptions, fn: Fn): unknown;

  /**
   * テストテストスイートを宣言します。
   *
   * @param name テストの結果に表示されるテストスイートの名前。
   * @param fn テストケースを宣言する関数。
   */
  export declare function describe(name: string, fn: () => void): unknown;

  /**
   * テストテストスイートを宣言します。
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
