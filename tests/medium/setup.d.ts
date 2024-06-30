declare function getInitializedSurreal(): Promise<{
  endpoint: string;
  Surreal: import("surreal-js").Surreal<
    typeof import("surreal-js/full").Client
  >;
}>;
