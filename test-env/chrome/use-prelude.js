import "./assert.js";

Object.assign(globalThis, {
  TEST_ENV: "Chrome",
  test(name, fn) {
    __testQueue.push({ name, fn });
  },
});

if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function withResolvers() {
    let resolve, reject;
    const promise = new this((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}
