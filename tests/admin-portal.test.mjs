import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("admin portal has a dedicated login and protected dashboard routes", async () => {
  const login = await readFile("app/admin/login/page.tsx", "utf8");
  const dashboard = await readFile("app/admin/page.tsx", "utf8");
  const sidebar = await readFile("components/admin-sidebar.tsx", "utf8");
  const sections = await readFile("app/admin/[...section]/page.tsx", "utf8");
  const menu = await readFile("components/admin-account-menu.tsx", "utf8");
  const notifications = await readFile("components/admin-notifications.tsx", "utf8");
  const usersApi = await readFile("app/api/admin/users/[id]/role/route.ts", "utf8");
  const operations = await readFile("components/admin-operations.tsx", "utf8");
  assert.match(login, /AuthForm mode="login"/);
  assert.match(dashboard, /getServerAdmin\(\["SUPER_ADMIN", "ADMIN"\]\)/);
  assert.match(sidebar, /\/admin\/audit-logs/);
  assert.match(sidebar, /Operations/);
  assert.match(sections, /rolesForSection/);
  assert.match(sections, /getServerAdmin\(\[\.\.\.rolesForSection\(key\)\]\)/);
  assert.match(menu, /auth\.signOut/);
  assert.match(menu, /\/admin\/login/);
  assert.match(notifications, /External email and WhatsApp delivery is disabled/);
  assert.match(usersApi, /requireAdmin\(request, \["SUPER_ADMIN"\]\)/);
  assert.match(usersApi, /email_confirmed_at/);
  assert.match(usersApi, /ADMIN/);
  assert.match(operations, /MAKE ADMIN/);
});

test("first-admin provisioning is explicit, target-bound and refuses existing admins", async () => {
  const script = await readFile("scripts/provision-admin.mjs", "utf8");
  assert.match(script, /flbdevgqhfosbaaswwbf/);
  assert.match(script, /SUPABASE_SECRET_KEY/);
  assert.match(script, /WEDRIP_ADMIN_USER_ID/);
  assert.match(script, /provision_first_admin/);
  assert.match(script, /I_UNDERSTAND_THIS_CREATES_THE_FIRST_ADMIN/);
  assert.match(script, /email_confirmed_at/);
  assert.match(script, /provision_first_admin/);
  assert.doesNotMatch(script, /password.*createUser/i);
});
