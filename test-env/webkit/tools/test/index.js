export const ENV = "Chrome";

export function test(name, fn) {
  return it(name, function() {
    this.timeout(30 * 1_000);
    return fn.apply(this, arguments);
  });
}

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
