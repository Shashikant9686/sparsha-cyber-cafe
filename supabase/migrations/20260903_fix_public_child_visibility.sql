-- Restrict public content reads to active parents and unexpired announcements.
-- Admin access remains available through the existing public.is_admin() helper.

begin;

-- required_documents -> active parent service only for public readers.
drop policy if exists "public_read_required_documents"
on public.required_documents;

create policy "public_read_required_documents"
on public.required_documents
for select
to public
using (
  public.is_admin()
  or exists (
    select 1
    from public.services
    where services.id = required_documents.service_id
      and lower(services.status) = 'active'
  )
);

-- service_images -> active parent service only for public readers.
drop policy if exists "public_read_service_images"
on public.service_images;

create policy "public_read_service_images"
on public.service_images
for select
to public
using (
  public.is_admin()
  or exists (
    select 1
    from public.services
    where services.id = service_images.service_id
      and lower(services.status) = 'active'
  )
);

-- counselling_events -> active events only for public readers.
drop policy if exists "public_read_counselling_events"
on public.counselling_events;

create policy "public_read_counselling_events"
on public.counselling_events
for select
to public
using (
  public.is_admin()
  or lower(status) = 'active'
);

-- event_dates -> active parent counselling event only for public readers.
drop policy if exists "public_read_event_dates"
on public.event_dates;

create policy "public_read_event_dates"
on public.event_dates
for select
to public
using (
  public.is_admin()
  or exists (
    select 1
    from public.counselling_events
    where counselling_events.id = event_dates.counselling_event_id
      and lower(counselling_events.status) = 'active'
  )
);

-- announcements -> active and unexpired only for public readers.
drop policy if exists "public_read_announcements"
on public.announcements;

create policy "public_read_announcements"
on public.announcements
for select
to public
using (
  public.is_admin()
  or (
    lower(status) = 'active'
    and (expires_at is null or expires_at > now())
  )
);

-- announcement_images -> public only when their parent announcement is active
-- and not expired.
drop policy if exists "public_read_announcement_images"
on public.announcement_images;

create policy "public_read_announcement_images"
on public.announcement_images
for select
to public
using (
  public.is_admin()
  or exists (
    select 1
    from public.announcements
    where announcements.id = announcement_images.announcement_id
      and lower(announcements.status) = 'active'
      and (announcements.expires_at is null or announcements.expires_at > now())
  )
);

commit;
