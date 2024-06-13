import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("../../package.json", "utf8"));
const deps = {
  ...pkg.dependencies || {},
  ...pkg.devDependencies || {},
  ...pkg.peerDependencies || {},
  ...pkg.optionalDependencies || {},
};

const deno = JSON.parse(fs.readFileSync("deno.json.tmp", "utf8"));

for (const [name, version] of Object.entries(deps)) {
  deno.imports[name] ||= "npm:" + name + "@" + version;
}

fs.writeFileSync("deno.json.tmp", JSON.stringify(deno, null, 2));
