import type ClientBase from "@tai-kun/surrealdb/clients/basic";
import type { ClientConfig } from "@tai-kun/surrealdb/clients/basic";
import createSurql, {
  type CreateSurqlConfig,
  type Surql,
} from "./surql/create-surql";

type ClientConstructor = new(config: ClientConfig) => ClientBase;

export interface SurrealInit<C extends ClientConstructor>
  extends ClientConfig, Omit<CreateSurqlConfig, "formatter">
{
  readonly Client: C;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/)
 */
export interface Surreal<C extends ClientConstructor> {
  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#constructor)
   */
  new(): InstanceType<C> & AsyncDisposable;
}

export interface InitializedSurreal<C extends ClientConstructor> {
  Surreal: Surreal<C>;
  surql: Surql;
}

export default function initSurreal<C extends ClientConstructor>(
  init: SurrealInit<C>,
): InitializedSurreal<C> {
  const {
    Client,
    formatter,
    varPrefix,
    ...others
  } = init;

  // @ts-expect-error
  class Surreal extends Client {
    constructor() {
      super({
        formatter,
        ...others,
      });
    }

    async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
      await this.close();
    }
  }

  return {
    // @ts-expect-error
    Surreal,
    surql: createSurql({
      formatter,
      varPrefix,
    }),
  };
}
