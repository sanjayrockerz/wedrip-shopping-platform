import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("restricted staff RLS uses scoped permission functions", async () => {
  const sql = await readFile("supabase/migrations/20261125002400_role_scoped_rls.sql", "utf8");
  assert.match(sql, /user_can_manage_catalog/);
  assert.match(sql, /user_can_manage_commerce/);
  assert.match(sql, /user_can_manage_orders/);
  assert.match(sql, /user_can_verify_payments/);
  assert.match(sql, /drop policy if exists "Admins manage variants"/i);
  assert.match(sql, /drop policy if exists "Admins manage payments"/i);
  assert.doesNotMatch(sql, /using\s*\(public\.user_is_admin\(\)\)/i);
});
