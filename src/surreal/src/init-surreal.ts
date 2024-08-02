import type ClientBase from "@tai-kun/surrealdb/clients/basic";
import type { ClientConfig } from "@tai-kun/surrealdb/clients/basic";

type CC = new(config: ClientConfig) => ClientBase;

export interface SurrealInit<C extends CC> extends ClientConfig {
  readonly Client: C;
}

export interface Surreal<C extends CC> {
  new(): InstanceType<C> & AsyncDisposable;
}

export interface InitializedSurreal<C extends CC> {
  Surreal: Surreal<C>;
}

export default function initSurreal<C extends CC>(
  init: SurrealInit<C>,
): InitializedSurreal<C> {
  const {
    Client,
    engines,
    formatter,
    validator,
  } = init;

  // @ts-expect-error
  class Surreal extends Client {
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
  };
}
