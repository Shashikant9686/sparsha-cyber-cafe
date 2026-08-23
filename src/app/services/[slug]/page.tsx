import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ServiceDetailClient from '@/components/services/ServiceDetailClient';

const SITE_NAME = 'Sparsha Cyber Cafe & Online Seva Kendra';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparsha-cyber-cafe.vercel.app';
const SHOP_PHONE = '+91 96861 68988';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// 1. Static Paths Pre-generation for fast load times
export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data: services } = await supabase
      .from('services')
      .select('slug')
      .eq('status', 'active');

    return (services || []).map((service) => ({
      slug: service.slug,
    }));
  } catch (err) {
    console.error('Failed to generate static params:', err);
    return [];
  }
}

// 2. Dynamic SEO & Social Share Metadata Generator
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const supabase = await createClient();
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!service) {
    return {
      title: 'Service Not Found | Sparsha Online Seva',
      description: 'The requested government or online application service is unavailable.',
    };
  }

  const title = `${service.name} | Application & Required Documents - Sparsha Cyber Cafe`;
  const description =
    service.prerequisites ||
    service.steps ||
    `Apply for ${service.name} at Sparsha Cyber Cafe Aland. Check required documents checklist, govt official fees, and processing times.`;

  return {
    title,
    description,
    keywords: [
      service.name,
      'Sparsha Cyber Cafe Aland',
      'Online Application Kalaburagi',
      'Seva Sindhu Aland',
      'Required Documents Checklist'
    ],
    alternates: {
      canonical: `${SITE_URL}/services/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/services/${slug}`,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// 3. Full Server Page Component
export default async function ServiceDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const supabase = await createClient();

  // Fetch Service Record
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (serviceError || !service) {
    console.error('Service lookup failed:', slug, serviceError);
    notFound();
  }

  // Fetch Category
  let categoryData = null;
  if (service.category_id) {
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('id', service.category_id)
      .maybeSingle();
    categoryData = cat;
  }

  // Fetch Related Required Documents
  const { data: documents } = await supabase
    .from('required_documents')
    .select('*')
    .eq('service_id', service.id)
    .order('display_order', { ascending: true });

  // Fetch Related Images / Samples
  const { data: images } = await supabase
    .from('service_images')
    .select('*')
    .eq('service_id', service.id)
    .order('display_order', { ascending: true });

  // Fetch Related Services in same category for suggestions
  let relatedServices: Array<{ id: string; name: string; slug: string; fee: number | null }> = [];
  if (service.category_id) {
    const { data: related } = await supabase
      .from('services')
      .select('id, name, slug, fee')
      .eq('category_id', service.category_id)
      .neq('id', service.id)
      .eq('status', 'active')
      .limit(4);
    relatedServices = related || [];
  }

  // Build Structured Data for Google Rich Snippets (Schema.org JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: service.name,
        serviceType: categoryData?.name || 'Online Citizen Service',
        provider: {
          '@type': 'LocalBusiness',
          name: SITE_NAME,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Aland',
            addressRegion: 'Karnataka',
            addressCountry: 'IN',
          },
          telephone: SHOP_PHONE,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: (service.fee ?? 0) + (service.service_charge ?? 0),
          description: `Govt Fee: ₹${service.fee ?? 0}, Service Charge: ₹${service.service_charge ?? 0}`,
        },
        termsOfService: `${SITE_URL}/services/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: `${SITE_URL}/services`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.name,
            item: `${SITE_URL}/services/${slug}`,
          },
        ],
      },
    ],
  };

  const completeService = {
    ...service,
    categories: categoryData,
    required_documents: documents || [],
    service_images: images || [],
    relatedServices,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ServiceDetailClient service={completeService} />
    </>
  );
}