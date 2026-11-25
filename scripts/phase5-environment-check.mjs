const environment = process.env.PHASE5_ENVIRONMENT ?? "";
const url = process.env.PHASE5_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const databaseUrl = process.env.PHASE5_DATABASE_URL ?? "";
const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();
const isLocal = environment === "local" || /^(localhost|127\.0\.0\.1)$/.test(host);
const isStaging = environment === "staging";
const hasRequiredTarget = Boolean(url && databaseUrl);
console.log(JSON.stringify({ environment: environment || "unset", supabase_host: host || "unset", has_database_target: Boolean(databaseUrl), safe_target: isLocal || isStaging, ready_for_tests: hasRequiredTarget && (isLocal || isStaging) }, null, 2));
if (!environment || (!isLocal && !isStaging) || !hasRequiredTarget) process.exitCode = 2;
