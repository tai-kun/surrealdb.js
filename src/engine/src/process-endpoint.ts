export default function processEndpoint(endpoint: string | URL): URL {
  endpoint = new URL(endpoint);

  if (!endpoint.pathname.endsWith("/rpc")) {
    if (!endpoint.pathname.endsWith("/")) {
      endpoint.pathname += "/";
    }

    endpoint.pathname += "rpc";
  }

  return endpoint;
}
