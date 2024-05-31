import "./assert.js";

Object.assign(globalThis, {
  TEST_ENV: "Deno",
  test: Deno.test,
});
