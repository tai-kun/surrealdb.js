declare module "@pkg/surrealdb" {
  export declare const ready: Promise<{
    host: string;
    hostname: string;
    port: number;
  }>;
}
