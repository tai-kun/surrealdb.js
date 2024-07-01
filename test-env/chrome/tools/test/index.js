export const ENV = "Chrome";

export function test(...args) {
  const [name, options, fn] = args.length === 3
    ? args
    : [args[0], {}, args[1]];
  const { skip = false, timeout = 5_000 } = options;

  if (skip) {
    if (typeof skip === "string") {
      return it(name + "  # Skip: " + skip, function() {});
    } else {
      return it(name + "  # Skip", function() {});
    }
  } else {
    return it(name, function() {
      this.timeout(timeout);

      return fn.apply(this, arguments);
    });
  }
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
