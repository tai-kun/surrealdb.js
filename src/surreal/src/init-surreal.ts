import type ClientBase from "@tai-kun/surrealdb/clients/basic";
import type { ClientConfig } from "@tai-kun/surrealdb/clients/basic";
import createSurql, {
  type CreateSurqlConfig,
  type Surql,
} from "./create-surql";

type CC = new(config: ClientConfig) => ClientBase;

export interface SurrealInit<C extends CC>
  extends ClientConfig, Omit<CreateSurqlConfig, "formatter">
{
  readonly Client: C;
}

export interface Surreal<C extends CC> {
  new(): InstanceType<C> & AsyncDisposable;
}

export interface InitializedSurreal<C extends CC> {
  Surreal: Surreal<C>;
  surql: Surql;
}

export default function initSurreal<C extends CC>(
  init: SurrealInit<C>,
): InitializedSurreal<C> {
  const {
    Client,
    engines,
    formatter,
    validator,
    varPrefix,
  } = init;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/)
   */
  // @ts-expect-error
  class Surreal extends Client {
    /**
     * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#constructor)
     */
    constructor() {
      super({
        engines,
        formatter,
        validator,
      });
    }

    async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
      await this.disconnect();
    }
  }

  return {
    // @ts-expect-error
    Surreal,
    ...createSurql({
      formatter,
      varPrefix,
    }),
  };
}
