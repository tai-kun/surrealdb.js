declare function getInitializedSurreal(): Promise<{
  endpoint: string;
  Surreal: import("@tai-kun/surreal").Surreal<
    typeof import("@tai-kun/surreal/full").Client
  >;
}>;
