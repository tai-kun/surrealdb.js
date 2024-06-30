declare function getInitializedSurreal(): Promise<{
  endpoint: string;
  Surreal: import("surrealjs").Surreal<
    typeof import("surrealjs/full").Client
  >;
}>;
