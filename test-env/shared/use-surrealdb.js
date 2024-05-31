import process from "node:process";
import { GenericContainer, Network, PullPolicy, Wait } from "testcontainers";

const { SURREALDB_DOCKER_IMAGE_TAG } = process.env;
const DOCKER_IMAGE = `surrealdb/surrealdb:${SURREALDB_DOCKER_IMAGE_TAG}`;

const network = await new Network().start();
const surrealdb = await new GenericContainer(DOCKER_IMAGE)
  .withPullPolicy(
    SURREALDB_DOCKER_IMAGE_TAG === "latest"
      ? PullPolicy.alwaysPull()
      : PullPolicy.defaultPolicy(),
  )
  .withNetwork(network)
  .withExposedPorts(8000)
  .withWaitStrategy(Wait.forHttp("/health", 8000))
  .withStartupTimeout(15e3)
  .withCommand([
    "start",
    ...["--bind", "0.0.0.0:8000"],
    ...["--username", "root"],
    ...["--password", "root"],
  ])
  .start();

Object.assign(globalThis, {
  SURREALDB: {
    PORT_NUMBER: 8000,
    CONTAINER_NAME: surrealdb.getName().substring("/".length),
    DOCKER_NETWORK: network,
  },
  SURREALDB_HOST: `${surrealdb.getHost()}:${surrealdb.getMappedPort(8000)}`,
});
