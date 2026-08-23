import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CounsellingForm from '@/components/admin/CounsellingForm';

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditCounsellingPage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from('counselling_events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (eventError || !event) {
    notFound();
  }

  const { data: eventDates } = await supabase
    .from('event_dates')
    .select('*')
    .eq('counselling_event_id', id)
    .order('display_order', { ascending: true });

  const initialData = {
    ...event,
    event_dates: eventDates || []
  };

  return <CounsellingForm initialData={initialData} eventId={id} />;
}