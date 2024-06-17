import { initSurreal } from "@tai-kun/surrealdb";
import { webSocketEngine } from "@tai-kun/surrealdb/engines";
import { JsonFormatter } from "@tai-kun/surrealdb/formatters";
import { Client } from "@tai-kun/surrealdb/full";
import { EmptyValidator } from "@tai-kun/surrealdb/validators";
import { ready } from "@tools/surrealdb";

async function getInitializedSurreal() {
  const endpoint = await ready;
  const surreal = initSurreal({
    Client,
    engines: {
      ws: webSocketEngine,
    },
    Formatter: JsonFormatter,
    Validator: EmptyValidator,
  });

  return {
    endpoint: `ws://${endpoint.host}`,
    ...surreal,
  };
}

Object.assign(globalThis, { getInitializedSurreal });
