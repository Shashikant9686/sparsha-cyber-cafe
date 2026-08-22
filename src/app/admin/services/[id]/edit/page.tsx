'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ServiceForm from '@/components/admin/ServiceForm';

export default function AdminEditServicePage() {
  const params = useParams();
  const id = params?.id as string;

  return <ServiceForm initialServiceId={id} />;
}