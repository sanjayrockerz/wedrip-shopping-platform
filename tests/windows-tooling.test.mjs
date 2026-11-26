import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("project tooling does not require Bash or WSL", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.match(packageJson.scripts.lint, /sites-env\.mjs/);
  assert.doesNotMatch(packageJson.scripts.lint, /bash\s+scripts\/sites-env\.sh/);
});
