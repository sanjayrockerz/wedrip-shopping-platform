import type { SupabaseClient } from "@supabase/supabase-js";
export async function recordAudit(client: SupabaseClient, _actorUserId: string, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown> = {}) {
  const { error } = await client.rpc("record_audit_event", {
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_metadata: metadata,
  });
  if (error) console.error("[audit] failed", error.message);
}
