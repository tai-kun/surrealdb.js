import type ClientBase from "@tai-kun/surrealdb/clients/basic";
import type { ClientConfig } from "@tai-kun/surrealdb/clients/basic";
import createSurql, {
  type CreateSurqlConfig,
  type Surql,
} from "./surql/create-surql";

type ClientConstructor = new(config: ClientConfig) => ClientBase;

export interface SurrealInit<TClientConstructor extends ClientConstructor>
  extends ClientConfig, Omit<CreateSurqlConfig, "formatter">
{
  readonly Client: TClientConstructor;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/)
 */
export interface Surreal<TClientConstructor extends ClientConstructor> {
  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#constructor)
   */
  new(): InstanceType<TClientConstructor> & AsyncDisposable;
}

export interface InitializedSurreal<
  TClientConstructor extends ClientConstructor,
> {
  Surreal: Surreal<TClientConstructor>;
  surql: Surql;
}

export default function initSurreal<
  TClientConstructor extends ClientConstructor,
>(
  init: SurrealInit<TClientConstructor>,
): InitializedSurreal<TClientConstructor> {
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
