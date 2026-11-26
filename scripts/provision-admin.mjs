import { createClient } from "@supabase/supabase-js";
import { assertApprovedTarget, loadProjectEnv } from "./load-env.mjs";

const targetProject = "flbdevgqhfosbaaswwbf";
const env = loadProjectEnv();
const url = env.SUPABASE_URL ?? "";
const secret = env.SUPABASE_SECRET_KEY ?? "";
const userId = env.WEDRIP_ADMIN_USER_ID ?? "";
const role = env.WEDRIP_ADMIN_ROLE ?? "SUPER_ADMIN";
const confirmation = env.WEDRIP_ADMIN_PROVISION_CONFIRM ?? "";

assertApprovedTarget(url);
if (!secret) throw new Error("SUPABASE_SECRET_KEY is required through a secure environment variable.");
if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error("WEDRIP_ADMIN_USER_ID must be the explicitly designated Supabase auth user UUID.");
if (!["SUPER_ADMIN", "ADMIN"].includes(role)) throw new Error("Only SUPER_ADMIN or ADMIN can be provisioned by this one-time script.");
if (confirmation !== "I_UNDERSTAND_THIS_CREATES_THE_FIRST_ADMIN") throw new Error("Set the exact confirmation phrase to authorize first-admin provisioning.");

const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: userResult, error: userError } = await admin.auth.admin.getUserById(userId);
if (userError) throw userError;
if (!userResult.user) throw new Error("The explicitly designated auth user was not found.");
if (!userResult.user.email_confirmed_at) throw new Error("The explicitly designated Auth user must have a confirmed email.");

const { data: provisionedId, error: provisionError } = await admin.rpc("provision_first_admin", { p_user_id: userId, p_role: role });
if (provisionError) throw provisionError;
if (provisionedId !== userId) throw new Error("Provisioning returned an unexpected administrator identity.");
console.log(JSON.stringify({ provisioned: true, role, target_project: targetProject, user_id: userId }));
