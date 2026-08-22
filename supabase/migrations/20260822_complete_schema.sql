-- ==============================================================================
-- SPARSHA CYBER CAFE & LAND - DATABASE SCHEMA MIGRATION
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Helper function for auto-updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  icon text default 'Layers',
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists tr_categories_updated_at on public.categories;
create trigger tr_categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

-- 3. SERVICES TABLE
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  fee text,
  service_charge text,
  submission_method text default 'Both',
  start_date date,
  last_date date,
  official_link text,
  status text default 'Active',
  featured boolean default false,
  display_order integer default 0,
  disclaimer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_services_category_id on public.services(category_id);
create index if not exists idx_services_slug on public.services(slug);

drop trigger if exists tr_services_updated_at on public.services;
create trigger tr_services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

-- 4. REQUIRED DOCUMENTS TABLE
create table if not exists public.required_documents (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references public.services(id) on delete cascade,
  document_name text not null,
  description text,
  is_mandatory boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_required_documents_service_id on public.required_documents(service_id);

drop trigger if exists tr_required_documents_updated_at on public.required_documents;
create trigger tr_required_documents_updated_at
  before update on public.required_documents
  for each row execute function public.handle_updated_at();

-- 5. SERVICE IMAGES TABLE
create table if not exists public.service_images (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references public.services(id) on delete cascade,
  image_url text not null,
  image_type text default 'poster',
  alt_text text,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_service_images_service_id on public.service_images(service_id);

-- 6. ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  image_url text,
  start_date date,
  last_date date,
  official_link text,
  status text default 'active',
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists tr_announcements_updated_at on public.announcements;
create trigger tr_announcements_updated_at
  before update on public.announcements
  for each row execute function public.handle_updated_at();

-- 7. COUNSELLING EVENTS TABLE
create table if not exists public.counselling_events (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid references public.services(id) on delete set null,
  exam_type text not null,
  title text not null,
  academic_year text not null default '2026-27',
  description text,
  official_portal_url text,
  status text default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists tr_counselling_events_updated_at on public.counselling_events;
create trigger tr_counselling_events_updated_at
  before update on public.counselling_events
  for each row execute function public.handle_updated_at();

-- 8. DYNAMIC EVENT DATES TABLE
create table if not exists public.event_dates (
  id uuid primary key default uuid_generate_v4(),
  counselling_event_id uuid not null references public.counselling_events(id) on delete cascade,
  title text not null,
  date_text text not null,
  description text,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_event_dates_counselling_event_id on public.event_dates(counselling_event_id);