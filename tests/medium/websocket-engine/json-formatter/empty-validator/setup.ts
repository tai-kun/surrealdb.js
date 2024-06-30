import { ready } from "@tools/surrealdb";
import { initSurreal } from "surrealjs";
import { webSocketEngine } from "surrealjs/engines";
import { JsonFormatter } from "surrealjs/formatters";
import { Client } from "surrealjs/full";
import { EmptyValidator } from "surrealjs/validators";

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
