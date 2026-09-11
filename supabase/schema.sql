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
  created_at timestamptz not null default now()
);

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
