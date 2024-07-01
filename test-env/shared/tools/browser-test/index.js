export function test(...args) {
  const [name, options, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  const {
    skip = false,
    timeout = 5_000,
  } = options;

  if (skip) {
    if (typeof skip === "string") {
      return globalThis.it(name + " # SKIP: " + skip, function() {});
    } else {
      return globalThis.it(name + " # SKIP", function() {});
    }
  } else {
    return globalThis.it(name, function(done) {
      this.timeout(timeout);
      (async () => {
        await fn();
      })().then(done, done);
    });
  }
}

export function after(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];
  const { timeout = 5_000 } = options;

  return globalThis.after(function(done) {
    this.timeout(timeout);
    (async () => {
      await fn();
    })().then(done, done);
  });
}

export function before(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];
  const { timeout = 5_000 } = options;

  return globalThis.before(function(done) {
    this.timeout(timeout);
    (async () => {
      await fn();
    })().then(done, done);
  });
}

export function describe(...args) {
  const [name, options, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  const { skip = false } = options;

  if (skip) {
    if (typeof skip === "string") {
      return globalThis.describe(name + " # SKIP: " + skip, function() {});
    } else {
      return globalThis.describe(name + " # SKIP", function() {});
    }
  } else {
    return globalThis.describe(name, fn);
  }
}
