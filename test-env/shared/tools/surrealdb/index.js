import { ENV } from "@tools/test";

let ready;

if (ENV === "Chrome" || ENV === "Firefox" || ENV === "WebKit") {
  ready = Promise.resolve({
    get host() {
      return `${SURREALDB.hostname}:${SURREALDB.port}`;
    },
    get hostname() {
      return SURREALDB.hostname;
    },
    get port() {
      return SURREALDB.port;
    },
  });
} else {
  ready = import("./setup.js").then(({ setup }) => setup());
}

ready = ready.then(endpoint => {
  console.log(`Using endpoint: ${endpoint.host}`);

  return endpoint;
});

export { ready };
