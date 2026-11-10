import fs from "node:fs";
import path from "node:path";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^"|"$/g, "");
}
const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const root = ".next/static";
let leaked = false;
if (secret && fs.existsSync(root)) {
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (fs.readFileSync(file).includes(secret)) leaked = true;
    }
  };
  walk(root);
}
console.log(JSON.stringify({ serviceRoleBundled: leaked, envIgnored: fs.existsSync(".gitignore") && fs.readFileSync(".gitignore", "utf8").includes(".env*") }));
if (leaked) process.exit(1);
