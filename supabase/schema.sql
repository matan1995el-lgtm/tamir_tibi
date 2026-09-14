-- Metaline — initial Supabase schema
-- Apply once DB access is restored (see project notes: Postgres role auth
-- is currently failing on project lzdmxrujezlkabfbatrj — needs a DB
-- password reset from the Supabase dashboard by the project owner).

create extension if not exists "pgcrypto";

-- Public content tables (read-only to anonymous visitors, writable only
-- by authenticated admin users via the admin panel).

create table if not exists site_settings (
  id int primary key default 1,
  phone text,
  whatsapp text,
  email text,
  address text,
  hours text,
  facebook_url text,
  instagram_url text,
  years_in_business int,
  projects_count int,
  warranty_years int,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists gallery_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  image_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null,
  author_role text,
  rating int not null default 5 check (rating between 1 and 5),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists pricing_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount_label text not null,
  description text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Leads: public (anonymous) can INSERT only; SELECT/UPDATE restricted to
-- authenticated admin users.
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  service text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  created_at timestamptz not null default now(),
  -- Client-generated per-submit-attempt key. Lets /api/contact treat a
  -- retried request (lost response, network blip) as already-saved
  -- instead of inserting a duplicate lead — see migration
  -- add_leads_idempotency_key.
  idempotency_key text,
  -- Service area / town the lead needs work done in — see migration
  -- add_leads_area.
  area text
);
create unique index if not exists leads_idempotency_key_uidx on leads (idempotency_key) where idempotency_key is not null;

alter table site_settings enable row level security;
alter table services enable row level security;
alter table gallery_projects enable row level security;
alter table testimonials enable row level security;
alter table pricing_items enable row level security;
alter table leads enable row level security;

-- Public read access to published content. Scoped explicitly `to anon` /
-- `to authenticated` rather than left as default (public) — with mixed
-- role-scoped policies on the same table, an unscoped policy can end up
-- ambiguous about which role it actually applies to.
create policy "public read site_settings" on site_settings for select to anon, authenticated using (true);
create policy "public read published services" on services for select to anon, authenticated using (published = true);
create policy "public read published gallery" on gallery_projects for select to anon, authenticated using (published = true);
create policy "public read published testimonials" on testimonials for select to anon, authenticated using (published = true);
create policy "public read published pricing" on pricing_items for select to anon, authenticated using (published = true);

-- Public insert-only access for the contact form (anon role only).
create policy "anon insert leads" on leads for insert to anon with check (true);

-- Authenticated (admin) full access — tighten to a specific role/claim
-- once the admin panel's auth model is wired up.
create policy "admin all site_settings" on site_settings for all to authenticated using (true) with check (true);
create policy "admin all services" on services for all to authenticated using (true) with check (true);
create policy "admin all gallery" on gallery_projects for all to authenticated using (true) with check (true);
create policy "admin all testimonials" on testimonials for all to authenticated using (true) with check (true);
create policy "admin all pricing" on pricing_items for all to authenticated using (true) with check (true);
create policy "admin all leads" on leads for all to authenticated using (true) with check (true);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Added later: editable page text/images + navigation menu (admin
-- "תוכן עמודים" and "תפריט ניווט" screens) + optional custom logo.
-- Applied directly to the live project via the Supabase MCP tools;
-- kept here so the schema can be reproduced from scratch.
-- ---------------------------------------------------------------------

create table if not exists page_content (
  page text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table page_content enable row level security;

create policy "public read page_content" on page_content
  for select to anon, authenticated using (true);

create policy "admin all page_content" on page_content
  for all to authenticated using (true) with check (true);

insert into page_content (page, data) values
  ('home', '{}'::jsonb),
  ('about', '{}'::jsonb),
  ('contact', '{}'::jsonb)
on conflict (page) do nothing;

create table if not exists nav_menu_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now()
);

alter table nav_menu_items enable row level security;

create policy "public read visible nav_menu_items" on nav_menu_items
  for select to anon, authenticated using (is_visible = true);

create policy "admin all nav_menu_items" on nav_menu_items
  for all to authenticated using (true) with check (true);

insert into nav_menu_items (label, href, sort_order) values
  ('בית', '/', 0),
  ('אודות', '/about', 1),
  ('שירותים', '/services', 2),
  ('גלריה', '/gallery', 3),
  ('צור קשר', '/contact', 4)
on conflict do nothing;

alter table site_settings add column if not exists logo_url text;

-- Content images (page-content circles + site logo) reuse the same
-- public "gallery" storage bucket GalleryManager already uploads to,
-- under a content/ and branding/ path prefix respectively — no new
-- bucket or storage policy needed.
--
-- The "gallery" bucket itself + its two storage.objects policies (public
-- read, authenticated-admin write) were created directly in the Supabase
-- dashboard/MCP and never had their creating SQL committed here — added
-- below, exactly matching what's live, so this schema can actually be
-- reproduced from scratch as the comments throughout this file claim.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "public read gallery bucket" on storage.objects
  for select to anon, authenticated using (bucket_id = 'gallery');
create policy "authenticated write gallery bucket" on storage.objects
  for all to authenticated using (bucket_id = 'gallery') with check (bucket_id = 'gallery');

-- ---------------------------------------------------------------------
-- Added later: site theme (admin "עיצוב" screen) — accent color + font
-- pair, applied site-wide via CSS custom properties scoped to the public
-- (site) layout only, so the admin panel's own look never changes.
-- ---------------------------------------------------------------------

create table if not exists site_theme (
  id int primary key default 1,
  accent_color text not null default '#D4AF37',
  accent_color_2 text not null default '#F0D074',
  font_pair text not null default 'classic',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1),
  constraint valid_font_pair check (font_pair in ('classic', 'modern', 'elegant'))
);

alter table site_theme enable row level security;

create policy "public read site_theme" on site_theme
  for select to anon, authenticated using (true);

create policy "admin all site_theme" on site_theme
  for all to authenticated using (true) with check (true);

insert into site_theme (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Added later: admin roles/permissions, custom pages, blog, and site-wide
-- SEO settings (admin "משתמשים", "עמודים", "בלוג", "SEO" screens).
-- Applied directly to the live project via the Supabase MCP tools; kept
-- here so the schema can be reproduced from scratch.
--
-- Role model (WordPress-style, 4 fixed roles — see ROLE_SECTIONS in
-- src/lib/site-data.ts for the exact section map each non-owner role
-- gets in the admin nav):
--   owner     — full access to every screen, incl. Settings and Users
--   marketing — content, pages, blog, leads, services, gallery,
--               testimonials, pricing
--   designer  — content, pages, design, services, gallery, menu
--   seo       — blog, SEO
--
-- private.current_admin_role() is SECURITY DEFINER so it can read admin_users
-- for the calling user without recursing through admin_users' own RLS
-- policies. It lives in a `private` schema — never in PostgREST's
-- exposed-schema list — so it is NOT reachable as a public API call
-- (e.g. /rest/v1/rpc/current_admin_role); it is only usable from inside
-- RLS policy expressions, which resolve it by object id regardless of
-- which schema it lives in and run under the querying role's own
-- privileges. (A first version of this function lived in `public` with
-- EXECUTE revoked from anon/public — Supabase's security advisor still
-- flagged it as callable by `authenticated` via the RPC endpoint, so it
-- was moved here to close that off completely.)
-- ---------------------------------------------------------------------

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'marketing', 'designer', 'seo')),
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.current_admin_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from admin_users where id = auth.uid();
$$;

-- Not a public API: only usable from inside RLS policy expressions.
revoke execute on function private.current_admin_role() from public;
grant execute on function private.current_admin_role() to authenticated;

-- SELECT policies require private.current_admin_role() IS NOT NULL (i.e. a real,
-- still-existing admin_users row) rather than merely "authenticated" —
-- this is what makes deleting someone's admin_users row actually revoke
-- their read access immediately, even though their Supabase Auth session
-- technically remains valid until it expires. The admin dashboard layout
-- (src/app/admin/(dashboard)/layout.tsx) additionally force-signs-out and
-- redirects any session whose admin_users row is gone.
-- auth.uid() is wrapped in (select ...) below per Supabase's
-- auth_rls_initplan advisory, so Postgres evaluates it once per query
-- instead of re-evaluating it for every row — same access logic, faster
-- at scale. No behavior change.
create policy "admin_users select own or owner" on admin_users
  for select to authenticated using (id = (select auth.uid()) or private.current_admin_role() = 'owner');
create policy "admin_users owner insert" on admin_users
  for insert to authenticated with check (private.current_admin_role() = 'owner');
create policy "admin_users owner update" on admin_users
  for update to authenticated using (private.current_admin_role() = 'owner') with check (private.current_admin_role() = 'owner');
create policy "admin_users owner delete" on admin_users
  for delete to authenticated using (private.current_admin_role() = 'owner' and id <> (select auth.uid()));

-- Defense in depth for the "last owner" protection already enforced in the
-- Users admin UI (UsersManager.tsx blocks it client-side) — this trigger
-- makes it impossible at the database level too, so it holds even if two
-- owners race each other or the UI check is ever bypassed.
create or replace function private.protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE' and old.role = 'owner') or
     (tg_op = 'UPDATE' and old.role = 'owner' and new.role <> 'owner') then
    if (select count(*) from admin_users where role = 'owner' and id <> old.id) = 0 then
      raise exception 'cannot remove the last remaining owner';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_last_owner_trigger on admin_users;
create trigger protect_last_owner_trigger
  before update or delete on admin_users
  for each row execute function private.protect_last_owner();

-- Every existing admin table's SELECT policy from earlier sections
-- (`for all to authenticated using (true) with check (true)`) is replaced
-- here with a split, role-aware set: SELECT requires a real admin row,
-- INSERT/UPDATE/DELETE are gated per-role to match ROLE_SECTIONS.
drop policy if exists "admin all site_settings" on site_settings;
create policy "admin select site_settings" on site_settings for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert site_settings" on site_settings for insert to authenticated with check (private.current_admin_role() = 'owner');
create policy "admin update site_settings" on site_settings for update to authenticated using (private.current_admin_role() = 'owner') with check (private.current_admin_role() = 'owner');
create policy "admin delete site_settings" on site_settings for delete to authenticated using (private.current_admin_role() = 'owner');

drop policy if exists "admin all services" on services;
create policy "admin select services" on services for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert services" on services for insert to authenticated with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin update services" on services for update to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer'])) with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin delete services" on services for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer']));

drop policy if exists "admin all gallery" on gallery_projects;
create policy "admin select gallery" on gallery_projects for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert gallery" on gallery_projects for insert to authenticated with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin update gallery" on gallery_projects for update to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer'])) with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin delete gallery" on gallery_projects for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer']));

drop policy if exists "admin all testimonials" on testimonials;
create policy "admin select testimonials" on testimonials for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert testimonials" on testimonials for insert to authenticated with check (private.current_admin_role() = any (array['owner','marketing']));
create policy "admin update testimonials" on testimonials for update to authenticated using (private.current_admin_role() = any (array['owner','marketing'])) with check (private.current_admin_role() = any (array['owner','marketing']));
create policy "admin delete testimonials" on testimonials for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing']));

drop policy if exists "admin all pricing" on pricing_items;
create policy "admin select pricing" on pricing_items for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert pricing" on pricing_items for insert to authenticated with check (private.current_admin_role() = any (array['owner','marketing']));
create policy "admin update pricing" on pricing_items for update to authenticated using (private.current_admin_role() = any (array['owner','marketing'])) with check (private.current_admin_role() = any (array['owner','marketing']));
create policy "admin delete pricing" on pricing_items for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing']));

drop policy if exists "admin all leads" on leads;
-- Unlike every other admin table, leads SELECT is restricted to owner+marketing
-- (not "any admin role") — leads hold customer PII (name/phone/email/message)
-- and only owner/marketing have a "leads" nav section per ROLE_SECTIONS in
-- src/lib/site-data.ts, so a designer/seo admin must not be able to read
-- them even by querying the table directly.
create policy "admin select leads" on leads for select to authenticated using (private.current_admin_role() = any (array['owner','marketing']));
create policy "admin update leads" on leads for update to authenticated using (private.current_admin_role() = any (array['owner','marketing'])) with check (private.current_admin_role() = any (array['owner','marketing']));
create policy "admin delete leads" on leads for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing']));
-- (the anon insert-only policy on leads is unchanged — see above)

drop policy if exists "admin all page_content" on page_content;
create policy "admin select page_content" on page_content for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert page_content" on page_content for insert to authenticated with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin update page_content" on page_content for update to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer'])) with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin delete page_content" on page_content for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer']));

drop policy if exists "admin all nav_menu_items" on nav_menu_items;
create policy "admin select nav_menu_items" on nav_menu_items for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert nav_menu_items" on nav_menu_items for insert to authenticated with check (private.current_admin_role() = any (array['owner','designer']));
create policy "admin update nav_menu_items" on nav_menu_items for update to authenticated using (private.current_admin_role() = any (array['owner','designer'])) with check (private.current_admin_role() = any (array['owner','designer']));
create policy "admin delete nav_menu_items" on nav_menu_items for delete to authenticated using (private.current_admin_role() = any (array['owner','designer']));

drop policy if exists "admin all site_theme" on site_theme;
create policy "admin select site_theme" on site_theme for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert site_theme" on site_theme for insert to authenticated with check (private.current_admin_role() = any (array['owner','designer']));
create policy "admin update site_theme" on site_theme for update to authenticated using (private.current_admin_role() = any (array['owner','designer'])) with check (private.current_admin_role() = any (array['owner','designer']));
create policy "admin delete site_theme" on site_theme for delete to authenticated using (private.current_admin_role() = any (array['owner','designer']));

-- Content blocks (shared shape for custom_pages.blocks and
-- blog_posts.blocks): a small fixed set of block types
-- (heading/paragraph/image/button/spacer), stored as a jsonb array —
-- see ContentBlock in src/lib/site-data.ts and BlockEditor.tsx /
-- BlockRenderer.tsx for the admin editor and public renderer.

create table if not exists custom_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  blocks jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  og_image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table custom_pages enable row level security;

create policy "public read published custom_pages" on custom_pages
  for select to anon, authenticated using (published = true);
create policy "admin select custom_pages" on custom_pages for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert custom_pages" on custom_pages for insert to authenticated with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin update custom_pages" on custom_pages for update to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer'])) with check (private.current_admin_role() = any (array['owner','marketing','designer']));
create policy "admin delete custom_pages" on custom_pages for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing','designer']));

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  cover_image_url text,
  blocks jsonb not null default '[]'::jsonb,
  category text,
  tags text[] not null default '{}',
  author_name text,
  seo_title text,
  seo_description text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blog_posts enable row level security;

create policy "public read published blog_posts" on blog_posts
  for select to anon, authenticated using (published = true);
create policy "admin select blog_posts" on blog_posts for select to authenticated using (private.current_admin_role() is not null);
create policy "admin insert blog_posts" on blog_posts for insert to authenticated with check (private.current_admin_role() = any (array['owner','marketing','seo']));
create policy "admin update blog_posts" on blog_posts for update to authenticated using (private.current_admin_role() = any (array['owner','marketing','seo'])) with check (private.current_admin_role() = any (array['owner','marketing','seo']));
create policy "admin delete blog_posts" on blog_posts for delete to authenticated using (private.current_admin_role() = any (array['owner','marketing','seo']));

create table if not exists seo_settings (
  id int primary key default 1,
  default_meta_title text,
  default_meta_description text,
  default_og_image_url text,
  google_site_verification text,
  robots_index boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table seo_settings enable row level security;

create policy "public read seo_settings" on seo_settings
  for select to anon, authenticated using (true);
create policy "admin update seo_settings" on seo_settings
  for update to authenticated using (private.current_admin_role() = any (array['owner','seo'])) with check (private.current_admin_role() = any (array['owner','seo']));
-- No insert/delete policy: the single row is seeded once below and
-- always edited via UPDATE from the admin "SEO" screen.

insert into seo_settings (id) values (1) on conflict (id) do nothing;

-- After creating the FIRST admin_users row (the site owner), run this
-- once by hand with their real auth.users id, e.g.:
--   insert into admin_users (id, email, role)
--   values ('<uuid from auth.users>', 'owner@example.com', 'owner');
-- Every subsequent admin user is created through the admin panel's
-- "משתמשים" screen (owner-only), which calls the invite-user API route
-- (requires SUPABASE_SERVICE_ROLE_KEY — see README.md / .env.example).
