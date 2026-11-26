import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRoot = process.env.SITES_RUNTIME_ROOT || join(projectRoot, ".sites-runtime");
for (const directory of ["home", "npm-cache", "xdg-config", "tmp", "wrangler/logs"]) mkdirSync(join(runtimeRoot, directory), { recursive: true });

process.env.SITES_ENV_READY = "1";
process.env.SITES_PROJECT_ROOT = projectRoot;
process.env.HOME = join(runtimeRoot, "home");
process.env.XDG_CONFIG_HOME = join(runtimeRoot, "xdg-config");
process.env.TMPDIR = join(runtimeRoot, "tmp");
process.env.WRANGLER_WRITE_LOGS = "false";
process.env.WRANGLER_LOG_PATH = join(runtimeRoot, "wrangler/logs");
process.env.MINIFLARE_REGISTRY_PATH = join(runtimeRoot, "wrangler/registry");
process.env.npm_config_cache = join(runtimeRoot, "npm-cache");
process.env.npm_config_audit = "false";
process.env.npm_config_fund = "false";
process.env.npm_config_update_notifier = "false";
for (const key of ["NPM_CONFIG_CACHE", "npm_config_proxy", "npm_config_http_proxy", "npm_config_https_proxy", "NPM_CONFIG_PROXY", "NPM_CONFIG_HTTP_PROXY", "NPM_CONFIG_HTTPS_PROXY"]) delete process.env[key];

const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
if (args.length === 0) { console.error("usage: node scripts/sites-env.mjs -- command [args...]"); process.exit(64); }
const result = spawnSync(args[0], args.slice(1), { cwd: projectRoot, env: process.env, stdio: "inherit", shell: process.platform === "win32" });
if (result.error) { console.error(result.error.message); process.exit(1); }
process.exit(result.status ?? 1);
