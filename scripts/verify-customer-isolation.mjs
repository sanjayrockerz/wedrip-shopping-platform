import fs from "node:fs";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) { const match = line.match(/^([A-Z0-9_]+)=(.*)$/); if (match) env[match[1]] = match[2].replace(/^"|"$/g, ""); }
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !publishable || !secret) throw new Error("Supabase credentials are incomplete.");
const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const password = `Codex-${crypto.randomUUID()}-Aa1!`;
const users = [];
try {
  for (const label of ["a", "b"]) { const email = `wedrip-codex-${label}-${crypto.randomUUID()}@example.invalid`; const result = await admin.auth.admin.createUser({ email, password, email_confirm: true }); if (result.error) throw result.error; users.push(result.data.user); }
  const clients = [];
  for (const user of users) { const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } }); const result = await client.auth.signInWithPassword({ email: user.email, password }); if (result.error) throw result.error; clients.push(client); }
  const a = clients[0]; const b = clients[1];
  const addressResult = await a.from("addresses").insert({ user_id: users[0].id, name: "Codex Test", phone: "0000000000", address: "Test Address", address_line_1: "Test Address", city: "Chennai", state: "Tamil Nadu", postal_code: "600001", country: "India" }).select("id").single(); if (addressResult.error) throw addressResult.error;
  const addressRead = await b.from("addresses").select("id").eq("id", addressResult.data.id); if (addressRead.error) throw addressRead.error;
  const wishlistResult = await a.from("wishlists").insert({ user_id: users[0].id }).select("id").single(); if (wishlistResult.error) throw wishlistResult.error;
  const wishlistRead = await b.from("wishlists").select("id").eq("id", wishlistResult.data.id); if (wishlistRead.error) throw wishlistRead.error;
  const cartResult = await a.from("carts").insert({ user_id: users[0].id }).select("id").single(); if (cartResult.error) throw cartResult.error;
  const cartRead = await b.from("carts").select("id").eq("id", cartResult.data.id); if (cartRead.error) throw cartRead.error;
  const ownAddress = await a.from("addresses").select("id").eq("id", addressResult.data.id); if (ownAddress.error || ownAddress.data.length !== 1) throw new Error("Owner could not read own address.");
  const invalidLogin = await createClient(url, publishable, { auth: { persistSession: false } }).auth.signInWithPassword({ email: users[0].email, password: "wrong-password" });
  console.log(JSON.stringify({ test_users_created: true, login_a: true, login_b: true, invalid_login_rejected: Boolean(invalidLogin.error), owner_address_visible: ownAddress.data.length === 1, cross_user_address_hidden: addressRead.data.length === 0, cross_user_wishlist_hidden: wishlistRead.data.length === 0, cross_user_cart_hidden: cartRead.data.length === 0 }));
} finally { for (const user of users) await admin.auth.admin.deleteUser(user.id); }
