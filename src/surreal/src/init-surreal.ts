import type { ClientAbc, ClientAbcConfig } from "@tai-kun/surrealdb/client";

type CC = new(config: ClientAbcConfig) => any;

export interface SurrealInit<C extends CC> extends ClientAbcConfig {
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

    async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")](
      this: ClientAbc,
    ) {
      await this.disconnect();
    }
  }

  return {
    // @ts-expect-error
    Surreal,
  };
}
