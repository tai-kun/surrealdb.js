"use prelude";
"use surrealdb";

import { type LiveAction, surql, Uuid } from "@tai-kun/surrealdb/full";

function isUuid(value: any) {
  try {
    new Uuid(value);
    return true;
  } catch {
    return false;
  }
}

function withTimeout(ms: number) {
  const p = Promise.withResolvers<void>();
  const tp = Promise.withResolvers<void>();
  const tid = setTimeout(() => tp.reject(new Error("Timeout")), ms);

  return [
    Promise.race([
      p.promise.then(tp.resolve).finally(() => clearTimeout(tid)),
      tp.promise,
    ]),
    p.resolve,
  ] satisfies [any, any];
}

const createPersonSurql = surql`
  CREATE person:1 SET
    firstname = "John",
    lastname = "Doe";
`;
const updatePersonSurql = surql`
  UPDATE person:1 SET
    firstname = "Jane";
`;
const deletePersonSurql = surql`
  DELETE person:1;
`;

test(`${IT} should return a uuid`, async () => {
  await using db = await connect(SURREALDB);
  await db.use("tset_namespace", "tset_database");
  const queryUuid = await db.live<string>("person");

  assertEquals(typeof queryUuid, "string");
  assert(isUuid(queryUuid));
});

test(`${IT} should subscribe to a table`, async () => {
  await using db = await connect(SURREALDB);
  await db.use("tset_namespace", "tset_database");
  const queryUuid = await db.live<string>("person");
  const events: { action: LiveAction; result: unknown }[] = [];
  const [waitForDeleteEvent, done] = withTimeout(5e3);

  db.subscribe(queryUuid, (_, event) => {
    events.push(event);

    if (event.action === "DELETE") {
      done();
    }
  });
  await db.query(createPersonSurql);
  await db.query(updatePersonSurql);
  await db.query(deletePersonSurql);
  await waitForDeleteEvent;

  assertDeepEquals(events, [
    {
      action: "CREATE",
      result: {
        id: "person:1",
        firstname: "John",
        lastname: "Doe",
      },
    },
    {
      action: "UPDATE",
      result: {
        id: "person:1",
        firstname: "Jane",
        lastname: "Doe",
      },
    },
    {
      action: "DELETE",
      result: {
        id: "person:1",
        firstname: "Jane",
        lastname: "Doe",
      },
    },
  ]);
});
