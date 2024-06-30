import { initSurreal } from "@tai-kun/surreal";
import { httpEngine } from "@tai-kun/surreal/engines";
import { JsonFormatter } from "@tai-kun/surreal/formatters";
import { Client } from "@tai-kun/surreal/full";
import { EmptyValidator } from "@tai-kun/surreal/validators";
import { ready } from "@tools/surrealdb";

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
