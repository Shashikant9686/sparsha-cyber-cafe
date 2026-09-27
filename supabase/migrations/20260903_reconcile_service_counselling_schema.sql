-- Reconcile the tracked schema with the current service and counselling UI.
-- This migration is additive: it never drops, renames, or deletes columns/data.

begin;

-- Fields written and read by the current service form and detail pages.
alter table public.services
  add column if not exists processing_time text,
  add column if not exists prerequisites text,
  add column if not exists steps text,
  add column if not exists faq jsonb;

-- Canonical counselling fields used throughout the current application.
alter table public.counselling_events
  add column if not exists exam_name text,
  add column if not exists counselling_name text,
  add column if not exists year integer,
  add column if not exists official_link text;

alter table public.event_dates
  add column if not exists start_date date,
  add column if not exists end_date date;

-- Earlier migration history used legacy required columns. Relax their NOT NULL
-- constraints only when they exist, so current application inserts do not fail.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'counselling_events' and column_name = 'exam_type'
  ) then
    execute 'alter table public.counselling_events alter column exam_type drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'counselling_events' and column_name = 'title'
  ) then
    execute 'alter table public.counselling_events alter column title drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'counselling_events' and column_name = 'academic_year'
  ) then
    execute 'alter table public.counselling_events alter column academic_year drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'event_dates' and column_name = 'date_text'
  ) then
    execute 'alter table public.event_dates alter column date_text drop not null';
  end if;
end
$$;

-- Backfill only mappings that are unambiguous. Legacy columns are retained.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'counselling_events' and column_name = 'exam_type'
  ) then
    execute $sql$
      update public.counselling_events
      set exam_name = nullif(exam_type, '')
      where exam_name is null and nullif(exam_type, '') is not null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'counselling_events' and column_name = 'title'
  ) then
    execute $sql$
      update public.counselling_events
      set counselling_name = nullif(title, '')
      where counselling_name is null and nullif(title, '') is not null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'counselling_events' and column_name = 'official_portal_url'
  ) then
    execute $sql$
      update public.counselling_events
      set official_link = nullif(official_portal_url, '')
      where official_link is null and nullif(official_portal_url, '') is not null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'counselling_events' and column_name = 'academic_year'
  ) then
    execute $sql$
      update public.counselling_events
      set year = substring(academic_year from '^[0-9]{4}')::integer
      where year is null and academic_year ~ '^[0-9]{4}'
    $sql$;
  end if;
end
$$;

commit;
