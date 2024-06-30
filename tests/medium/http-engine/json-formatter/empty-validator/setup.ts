import { ready } from "@tools/surrealdb";
import { initSurreal } from "surreal-js";
import { httpEngine } from "surreal-js/engines";
import { JsonFormatter } from "surreal-js/formatters";
import { Client } from "surreal-js/full";
import { EmptyValidator } from "surreal-js/validators";

async function getInitializedSurreal() {
  const endpoint = await ready;
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
