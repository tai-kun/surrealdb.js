import "./assert.js";

Object.assign(globalThis, {
  TEST_ENV: "Firefox",
  test(name, fn) {
    __testQueue.push({ name, fn });
  },
});
