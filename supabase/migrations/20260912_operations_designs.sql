-- Operations and customer design workflow. Files stay in a private bucket.
insert into storage.buckets (id, name, public) values ('customer-designs', 'customer-designs', false) on conflict (id) do update set public = false;
alter table public.designs add column if not exists customer_message text;
alter table public.designs add column if not exists internal_message text;
alter table public.design_versions add column if not exists customer_message text;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_user_id uuid not null references auth.users(id),
  action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
alter table public.audit_logs enable row level security;
create policy "Users create own audit events" on public.audit_logs for insert with check (auth.uid() = actor_user_id);
create policy "Admins read audit events" on public.audit_logs for select using (public.user_is_admin());

create policy "Design owners upload private files" on storage.objects for insert to authenticated with check (bucket_id = 'customer-designs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Design owners read private files" on storage.objects for select to authenticated using (bucket_id = 'customer-designs' and ((storage.foldername(name))[1] = auth.uid()::text or public.user_is_admin()));
create policy "Design admins manage private files" on storage.objects for update to authenticated using (bucket_id = 'customer-designs' and public.user_is_admin()) with check (bucket_id = 'customer-designs' and public.user_is_admin());

alter table public.notification_events add column if not exists recipient text;
alter table public.notification_events add column if not exists provider_message_id text;
alter table public.notification_events add column if not exists failure_reason text;
alter table public.notification_events add column if not exists template_key text;
create table if not exists public.email_templates (
  key text primary key, subject_template text not null, body_template text not null, active boolean not null default true, updated_at timestamptz not null default now()
);
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(), notification_event_id uuid references public.notification_events(id) on delete set null,
  recipient text not null, event_type text not null, provider_message_id text, status text not null default 'NOT_CONFIGURED' check (status in ('PENDING','SENT','FAILED','NOT_CONFIGURED')), failure_reason text, created_at timestamptz not null default now(), sent_at timestamptz
);
alter table public.email_templates enable row level security; alter table public.whatsapp_messages enable row level security;
create policy "Admins manage email templates" on public.email_templates for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage WhatsApp messages" on public.whatsapp_messages for all using (public.user_is_admin()) with check (public.user_is_admin());

insert into public.email_templates(key,subject_template,body_template) values
('WELCOME','Welcome to WeDrip, {{customer_name}}','Welcome to WeDrip.'),
('ORDER_CONFIRMATION','Order {{order_number}} received','Your order {{order_number}} has been received.'),
('PAYMENT_CONFIRMATION','Payment confirmed for {{order_number}}','Payment for {{order_number}} is confirmed.'),
('DESIGN_UPLOADED','Design uploaded for {{order_number}}','Your design for {{product_name}} is now in review.'),
('DESIGN_PROOF_READY','Your WeDrip proof is ready','Review your design proof for {{order_number}}.'),
('REVISION_REQUESTED','Revision requested for {{order_number}}','A revision was requested for your design.'),
('DESIGN_APPROVED','Design approved for {{order_number}}','Your design is approved.'),
('ORDER_SHIPPED','Order {{order_number}} shipped','Your WeDrip order is on its way.'),
('ORDER_DELIVERED','Order {{order_number}} delivered','Your WeDrip order has been delivered.')
on conflict (key) do nothing;
alter table public.product_variants add column if not exists reserved_quantity integer not null default 0 check (reserved_quantity >= 0);
alter table public.product_variants add column if not exists sold_quantity integer not null default 0 check (sold_quantity >= 0);
