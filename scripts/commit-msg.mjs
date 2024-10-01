import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";

const root = path.join(import.meta.dirname, "..");
const debug = process.argv.includes("--debug");
const message = /** @type {string} */ (
  process.env["COMMIT_MESSAGE"]?.endsWith(".git/COMMIT_EDITMSG")
    ? fs.readFileSync(process.env["COMMIT_MESSAGE"], "utf-8")
    : process.env["COMMIT_MESSAGE"]
);

if (!debug && !message) {
  console.error("env.COMMIT_MESSAGE not found");
  process.exit(1);
}

// root
{
  const skip = [
    ".cache",
    ".git",
    ".github",
    ".history",
    ".temp",
    "dist",
    "node_modules",
    "src", // 別途設定
    "tests", // 別途設定
  ];

  for (const file of scan(root, `.?*`, skip)) {
    const scopes = [
      path.posix.normalize(file),
    ];
    match(message, {
      types: [
        "fix",
        "feat",
        "change",
        "revert",
      ],
      scopes,
      allowBreaking: true,
    });
    match(message, {
      types: [
        "docs",
        "perf",
        "chore",
        "style",
        "refactor",
      ],
      scopes,
    });
  }

  for (const file of scan(root, `*/**`, skip)) {
    const scopes = [
      // path.posix.normalize(path.dirname(file)),
      path.posix.normalize(file),
    ];
    match(message, {
      types: [
        "fix",
        "feat",
        "change",
        "revert",
      ],
      scopes,
      allowBreaking: true,
    });
    match(message, {
      types: [
        "docs",
        "perf",
        "chore",
        "style",
        "refactor",
      ],
      scopes,
    });
  }
}
// src
{
  for (const file of scan(path.join(root, "src"), "**")) {
    const scopes = [
      // path.posix.normalize(path.dirname(file)),
      path.posix.normalize(file),
    ];
    match(message, {
      types: [
        "fix",
        "feat",
        "change",
        "revert",
      ],
      scopes,
      allowBreaking: true,
    });
    match(message, {
      types: [
        "docs",
        "perf",
        "chore",
        "style",
        "refactor",
      ],
      scopes,
    });
  }
}
// tests
{
  for (const file of scan(path.join(root, "tests"), "**")) {
    const scopes = [
      // path.posix.normalize(path.dirname(file)),
      path.posix.normalize(file),
    ];
    match(message, {
      types: ["test"],
      scopes,
    });
  }
}
// ci
{
  match(message, {
    types: ["ci"],
  });
}
// dependabot
{
  match(message, {
    types: ["chore"],
    scopes: [
      "deps",
      "deps-dev",
    ],
  });
}
// release-please
{
  match(message, {
    types: ["chore"],
    scopes: [
      "main",
    ],
    commentPattern: /^release \d+\.\d+\.\d+(?:-[0-9a-z]+\.[0-9a-z]+)?/,
  });
}

if (!debug) {
  console.error(`
Invalid commit message:
~~~
${message}  
~~~
`);
  process.exit(1);
}

/**
 * @param {string} cwd
 * @param {string} pattern
 * @param {string[]} [skip]
 * @returns {string[]}
 */
function scan(cwd, pattern, skip) {
  const paths = fs.globSync(pattern, {
    cwd,
    exclude: skip && (file => {
      for (const name of skip) {
        if (file.startsWith(name + path.sep)) {
          return true;
        }
      }

      return false;
    }),
  });

  if (skip) {
    return paths.filter(p => skip.indexOf(p) === -1);
  }

  return paths;
}

// https://github.com/googleapis/release-please/blob/v16.12.2/src/commit.ts#L94
/**
 * @param {string} message
 * @param {object} schema
 * @param {string[]} schema.types
 * @param {string[]} [schema.scopes]
 * @param {boolean} [schema.allowBreaking]
 * @param {RegExp} [schema.commentPattern]
 * @returns {void}
 */
function match(message, schema) {
  const {
    types,
    scopes = [""],
    allowBreaking,
    commentPattern,
  } = schema;

  for (let scope of scopes) {
    if (scope === ".") {
      scope = "";
    }

    for (const type of types) {
      let summary = type;
      let pattern = `^${type}`;

      if (scope) {
        scope = scope
          .replaceAll("@", "") // GitHub でメンションになるので無効化
          .replaceAll("#", ""); // GitHub でリンクになるので無効化

        summary += `(${scope})`;
        pattern += `(${scope})`;
      }

      if (allowBreaking) {
        pattern += "!?";
      }

      pattern += ": ";

      if (commentPattern) {
        pattern += commentPattern.source;
      } else {
        pattern += ".+";
      }

      if (debug) {
        console.log(pattern);
        continue;
      }

      if (
        message.startsWith(`${summary}: `)
        && (
          commentPattern
            ? commentPattern.test(message.slice(summary.length + 2))
            : message.length > summary.length + 2
        )
      ) {
        console.log(`Matched: ${pattern}`);
        console.log(`Message: \n~~~\n${message}\n~~~\n`);
        process.exit(0);
      }

      if (
        allowBreaking
        && message.startsWith(`${summary}!: `)
        && (
          commentPattern
            ? commentPattern.test(message.slice(summary.length + 3))
            : message.length > summary.length + 3
        )
      ) {
        console.log(`Matched: ${pattern}`);
        console.log(`Message: \n~~~\n${message}\n~~~\n`);
        process.exit(0);
      }
    }
  }
}
