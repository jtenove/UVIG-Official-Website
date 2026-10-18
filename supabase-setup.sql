-- ============================================================
-- UVIG /admin content backend — Supabase setup
-- Safe to re-run. Creates:
--   site_admins           who may edit (by email)
--   site_content          one JSON document per editable section
--   site_content_history  every saved version (restore from /admin)
--   site-files bucket     uploaded images / PDFs
-- Security model:
--   * anyone can READ site_content (the public site needs it)
--   * only signed-in users whose email is in site_admins can write
--   * sign-ups are refused for any email not in site_admins
-- ============================================================

create table if not exists public.site_admins (
  email      text primary key check (email = lower(email)),
  added_at   timestamptz not null default now(),
  added_by   text
);

create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.site_content_history (
  id         bigint generated always as identity primary key,
  key        text not null,
  value      jsonb,
  action     text not null,          -- 'save' or 'reset'
  edited_by  text,
  edited_at  timestamptz not null default now()
);
create index if not exists site_content_history_key_idx
  on public.site_content_history (key, edited_at desc);

-- ---------- helpers ----------
create or replace function public.is_site_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.site_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

-- Stamp who/when on every write, and record a history row.
create or replace function public.site_content_stamp()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := lower(coalesce(auth.jwt() ->> 'email', 'database'));
  return new;
end;
$$;

create or replace function public.site_content_log()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  who text := lower(coalesce(auth.jwt() ->> 'email', 'database'));
  k   text;
begin
  if tg_op = 'DELETE' then
    k := old.key;
    insert into public.site_content_history (key, value, action, edited_by)
    values (old.key, null, 'reset', who);
  else
    k := new.key;
    insert into public.site_content_history (key, value, action, edited_by)
    values (new.key, new.value, 'save', who);
  end if;
  -- keep the newest 60 versions per section
  delete from public.site_content_history h
  where h.key = k
    and h.id not in (
      select id from public.site_content_history
      where key = k order by edited_at desc, id desc limit 60
    );
  return null;
end;
$$;

drop trigger if exists site_content_stamp on public.site_content;
create trigger site_content_stamp
  before insert or update on public.site_content
  for each row execute function public.site_content_stamp();

drop trigger if exists site_content_log on public.site_content;
create trigger site_content_log
  after insert or update or delete on public.site_content
  for each row execute function public.site_content_log();

-- Refuse sign-ups from anyone not on the editors list.
create or replace function public.site_signup_allowlist()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.site_admins where email = lower(new.email)) then
    raise exception 'This email is not on the UVIG editors list.';
  end if;
  return new;
end;
$$;

drop trigger if exists site_signup_allowlist on auth.users;
create trigger site_signup_allowlist
  before insert on auth.users
  for each row execute function public.site_signup_allowlist();

-- ---------- Row Level Security ----------
alter table public.site_admins          enable row level security;
alter table public.site_content         enable row level security;
alter table public.site_content_history enable row level security;

drop policy if exists "public read content" on public.site_content;
create policy "public read content" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "admins insert content" on public.site_content;
create policy "admins insert content" on public.site_content
  for insert to authenticated with check ((select public.is_site_admin()));

drop policy if exists "admins update content" on public.site_content;
create policy "admins update content" on public.site_content
  for update to authenticated
  using ((select public.is_site_admin())) with check ((select public.is_site_admin()));

drop policy if exists "admins delete content" on public.site_content;
create policy "admins delete content" on public.site_content
  for delete to authenticated using ((select public.is_site_admin()));

drop policy if exists "admins read history" on public.site_content_history;
create policy "admins read history" on public.site_content_history
  for select to authenticated using ((select public.is_site_admin()));

drop policy if exists "admins read editors" on public.site_admins;
create policy "admins read editors" on public.site_admins
  for select to authenticated using ((select public.is_site_admin()));

drop policy if exists "admins add editors" on public.site_admins;
create policy "admins add editors" on public.site_admins
  for insert to authenticated with check ((select public.is_site_admin()));

drop policy if exists "admins remove other editors" on public.site_admins;
create policy "admins remove other editors" on public.site_admins
  for delete to authenticated
  using ((select public.is_site_admin()) and email <> lower(coalesce(auth.jwt() ->> 'email', '')));

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant select on public.site_content_history to authenticated;
grant select, insert, delete on public.site_admins to authenticated;

-- ---------- Uploads bucket (public read, admin write) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-files', 'site-files', true, 15728640,
        array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins upload site files" on storage.objects;
create policy "admins upload site files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-files' and (select public.is_site_admin()));

drop policy if exists "admins update site files" on storage.objects;
create policy "admins update site files" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-files' and (select public.is_site_admin()));

drop policy if exists "admins delete site files" on storage.objects;
create policy "admins delete site files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-files' and (select public.is_site_admin()));

-- ---------- Initial editors ----------
insert into public.site_admins (email, added_by) values
  ('jtenove1@gmail.com', 'setup'),
  ('24georgemurray@gmail.com', 'setup'),
  ('willhansen66@gmail.com', 'setup')
on conflict (email) do nothing;
