import { ready } from "@tools/surrealdb";
import { initSurreal } from "surrealjs";
import { httpEngine } from "surrealjs/engines";
import { JsonFormatter } from "surrealjs/formatters";
import { Client } from "surrealjs/full";
import { ZodValidator } from "surrealjs/validators";

async function getInitializedSurreal() {
  const endpoint = await ready;
  const surreal = initSurreal({
    Client,
    engines: {
      http: httpEngine,
    },
    Formatter: JsonFormatter,
    Validator: ZodValidator,
  });

  return {
    endpoint: `http://${endpoint.host}`,
    ...surreal,
  };
}

Object.assign(globalThis, { getInitializedSurreal });
