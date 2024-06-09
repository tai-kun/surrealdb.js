declare module "@pkg/test" {
  type TestFn = () => void | Promise<void>;

  /**
   * The environment in which the test is running.
   */
  export declare const ENV:
    // JavaScript/TypeScript runtimes
    | "Bun"
    | "Deno"
    | "Node"
    // Browsers
    | "Chrome"
    | "Firefox"
    // Edge cases
    | "CloudflareWorkers";

  /**
   * Defines a test case with the given name and function.
   *
   * @param name - The name of the test case.
   * @param fn - The function that implements the test case.
   */
  export declare function test(name: string, fn: TestFn): void;
}
