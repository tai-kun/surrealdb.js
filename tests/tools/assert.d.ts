declare module "@tools/assert" {
  type AnyConstructor =
    | (new(...args: any[]) => any)
    | (abstract new(...args: any[]) => any);

  /**
   * アサーションが失敗した場合に投げられるエラー。
   *
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/AssertionError
   */
  export declare class AssertionError extends Error {
    /**
     * @param message アサーションが失敗したときに表示するメッセージ。
     */
    constructor(message: string);
  }

  /**
   * `expr` が真値ではない場合にエラーを投げます。
   *
   * @param expr テストする式。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assert
   */
  export declare function assert(expr: unknown, message?: string): void;

  /**
   * `expr` が真値である場合はエラーを投げます。
   *
   * @param expr テストする式。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertFalse
   */
  export declare function assertFalse(expr: unknown, message?: string): void;

  /**
   * 等価比較に `Object.is` を使用して、`actual` と `expected` が等しいことをアサーションします。
   * 等しくない場合は、エラーを投げます。
   *
   * @template T 比較する値の型。
   * @param actual 実際の値。
   * @param expected 期待する値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertStrictEquals
   */
  export declare function assertEquals<T>(
    actual: T,
    expected: T,
    message?: string,
  ): void;

  /**
   * 等価比較に `Object.is` を使用して、`actual` と `expected` が等しくないことをアサーションします。
   * 等しい場合は、エラーを投げます。
   *
   * @template T 比較する値の型。
   * @param actual 実際の値。
   * @param expected 期待する値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotStrictEquals
   */
  export declare function assertNotEquals<T>(
    actual: T,
    expected: T,
    message?: string,
  ): void;

  /**
   * `actual` と `expected` が深く等しいことをアサーションします。
   * 深く等しくない場合は、エラーを投げます。
   *
   * @template T 比較する値の型。
   * @param actual 実際の値。
   * @param expected 期待する値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertEquals
   */
  export declare function assertDeepEquals<T>(
    actual: T,
    expected: T,
    message?: string,
  ): void;

  /**
   * `actual` と `expected` が深く等しくないことをアサーションします。
   * 深く等しい場合は、エラーを投げます。
   *
   * @template T 比較する値の型。
   * @param actual 実際の値。
   * @param expected 期待する値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotEquals
   */
  export declare function assertNotDeepEquals<T>(
    actual: T,
    expected: T,
    message?: string,
  ): void;

  /**
   * `actual` と `expected` が深く等しいことをアサーションします。
   * 深く等しくない場合は、エラーを投げます。
   *
   * @template T 比較する値の型。
   * @param actual 実際の jsonifiable 値。
   * @param expected 期待する jsonifiable 値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   */
  export declare function assertJsonEquals<
    T extends import("type-fest").Jsonifiable,
  >(
    actual: T,
    expected: import("type-fest").Jsonifiable,
    message?: string,
  ): void;

  /**
   * `actual` と `expected` が深く等しくないことをアサーションします。
   * 深く等しい場合は、エラーを投げます。
   *
   * @template T 比較する値の型。
   * @param actual 実際の jsonifiable 値。
   * @param expected 期待する jsonifiable 値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   */
  export declare function assertJsonNotEquals<
    T extends import("type-fest").Jsonifiable,
  >(
    actual: T,
    expected: import("type-fest").Jsonifiable,
    message?: string,
  ): void;

  /**
   * `actual` が正規表現の `expected` と一致することをアサーションします。
   * 一致しない場合は、エラーを投げます。
   *
   * @param actual 実際の値。
   * @param expected 期待する値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertMatch
   */
  export declare function assertMatch(
    actual: string,
    expected: RegExp,
    message?: string,
  ): void;

  /**
   * `actual` が正規表現の `expected` と一致しないことをアサーションします。
   * 一致する場合は、エラーを投げます。
   *
   * @param actual 実際の値。
   * @param expected 期待する値。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotMatch
   */
  export declare function assertNotMatch(
    actual: string,
    expected: RegExp,
    message?: string,
  ): void;

  /**
   * `actual` が `expectedType` のインスタンスであることをアサーションします。
   * そうでない場合は、エラーを投げます。
   *
   * @template T 期待する値の型。
   * @param actual 実際の値。
   * @param expectedType 期待するクラス。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertInstanceOf
   */
  export declare function assertInstanceOf<T extends AnyConstructor>(
    actual: unknown,
    expectedType: T,
    message?: string,
  ): void;

  /**
   * `actual` が `expectedType` のインスタンスではないことをアサーションします。
   * 期待するクラスのインスタンスである場合は、エラーを投げます。
   *
   * @template T 期待する値の型。
   * @param actual 実際の値。
   * @param expectedType 期待するクラス。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @throws {AssertionError}
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotInstanceOf
   */
  export declare function assertNotInstanceOf<T extends AnyConstructor>(
    actual: unknown,
    expectedType: T,
    message?: string,
  ): void;

  /**
   * 関数を実行し、例外をスローすることを期待します。例外が投げられない場合は、エラーを投げます。
   *
   * 非同期関数には、{@link assertRejects} を使用します。
   *
   * @param fn 実行する関数。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @returns 投げられた例外。
   * @throws {AssertionError}
   */
  export declare function assertThrows(
    fn: () => unknown,
    message?: string,
  ): unknown;

  /**
   * 関数を実行し、例外をスローすることを期待します。例外が投げられない場合は、エラーを投げます。
   *
   * 非同期関数には、{@link assertRejects} を使用します。
   *
   * @template E 期待するエラーの型。
   * @param fn 実行する関数。
   * @param ErrorClass 期待するエラーのクラス。
   * @param messageIncludes エラーに含まれるべきメッセージ。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @returns 投げられた例外。
   * @throws {AssertionError}
   */
  export declare function assertThrows<E extends Error = Error>(
    fn: () => unknown,
    ErrorClass: new(...args: any[]) => E,
    messageIncludes?: string,
    message?: string,
  ): E;

  /**
   * 拒否されることを期待して、Promise を返す関数を実行します。
   *
   * 同期関数がスローすることをアサートするには、{@link assertThrows} を使用します。
   *
   * @param fn 実行する関数。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @returns 拒否された理由。
   * @throws {AssertionError}
   */
  export declare function assertRejects(
    fn: () => Promise<unknown>,
    message?: string,
  ): Promise<unknown>;

  /**
   * 拒否されることを期待して、Promise を返す関数を実行します。
   *
   * 同期関数がスローすることをアサートするには、{@link assertThrows} を使用します。
   *
   * @template E 期待するエラーの型。
   * @param fn 実行する関数。
   * @param ErrorClass 期待するエラーのクラス。
   * @param messageIncludes エラーに含まれるべきメッセージ。
   * @param message アサーションが失敗した場合に表示されるメッセージ。
   * @returns 拒否された理由。
   * @throws {AssertionError}
   */
  export declare function assertRejects<E extends Error = Error>(
    fn: () => Promise<unknown>,
    ErrorClass: new(...args: any[]) => E,
    messageIncludes?: string,
    message?: string,
  ): Promise<E>;

  /**
   * 到達不能なコードであることを示します。
   *
   * @param reason コードにアクセスできない理由。
   * @throws {AssertionError}
   */
  export declare function unreachable(reason?: string): never;
}
