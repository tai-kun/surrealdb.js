import { initSurreal } from "@tai-kun/surrealdb";
import { httpEngine } from "@tai-kun/surrealdb/engines";
import { JsonFormatter } from "@tai-kun/surrealdb/formatters";
import { Client } from "@tai-kun/surrealdb/full";
import { EmptyValidator } from "@tai-kun/surrealdb/validators";
import { ready } from "@tools/surrealdb";

async function getInitializedSurreal() {
  const endpoint = await ready;

  console.log(`Using endpoint: ${endpoint.host}`);

  const surreal = initSurreal({
    Client,
    engines: {
      http: httpEngine,
    },
    Formatter: JsonFormatter,
    Validator: EmptyValidator,
  });

  return {
    endpoint: `http://${endpoint.host}`,
    ...surreal,
  };
}

Object.assign(globalThis, { getInitializedSurreal });
