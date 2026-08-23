import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ServiceForm from '@/components/admin/ServiceForm';

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditServicePage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // 1. Fetch base service record by ID or slug
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error loading service for edit:', error);
  }

  if (!service) {
    notFound();
  }

  // 2. Fetch linked required documents
  const { data: docs } = await supabase
    .from('required_documents')
    .select('*')
    .eq('service_id', id)
    .order('display_order', { ascending: true });

  // 3. Fetch linked service images
  const { data: images } = await supabase
    .from('service_images')
    .select('*')
    .eq('service_id', id)
    .order('display_order', { ascending: true });

  const initialData = {
    ...service,
    required_documents: docs || [],
    service_images: images || [],
  };

  return <ServiceForm initialData={initialData} />;
}