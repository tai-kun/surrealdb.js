export interface ProcessEndpointOptions {
  readonly transformEndpoint?: "auto" | "preserve" | undefined;
}

export default function processEndpoint(
  endpoint: string | URL,
  options?: ProcessEndpointOptions | undefined,
): URL {
  endpoint = new URL(endpoint);

  if (
    options?.transformEndpoint !== "preserve"
    && !endpoint.pathname.endsWith("/rpc")
  ) {
    if (!endpoint.pathname.endsWith("/")) {
      endpoint.pathname += "/";
    }

    endpoint.pathname += "rpc";
  }

  return endpoint;
}
