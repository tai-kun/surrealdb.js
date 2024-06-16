declare function getInitializedSurreal(): Promise<{
  endpoint: string;
  Surreal: import("@tai-kun/surrealdb").Surreal<
    typeof import("@tai-kun/surrealdb/full").Client
  >;
}>;
