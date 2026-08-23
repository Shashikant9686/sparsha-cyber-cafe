import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import ServiceDetailClient from '@/components/services/ServiceDetailClient';

export const dynamic = 'force-dynamic';

const SITE_NAME = 'Sparsha Cyber Cafe & Online Seva Kendra';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparsha-cyber-cafe.vercel.app';
const SHOP_PHONE = '+91 96861 68988';
const SHOP_ADDRESS = 'Main Road, Near Bus Stand, Aland, Kalaburagi District, Karnataka - 585302';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-generate static route parameters for SEO indexing
 */
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();
    const { data: services, error } = await supabase
      .from('services')
      .select('slug')
      .eq('status', 'active');

    if (error || !services) {
      return [];
    }

    return services.map((service) => ({
      slug: service.slug,
    }));
  } catch (err) {
    console.error('generateStaticParams execution failure:', err);
    return [];
  }
}

/**
 * Generate rich SEO & OpenGraph Social metadata for Google and WhatsApp sharing
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;

    if (!slug) {
      return {
        title: 'Service Not Found | Sparsha Online Seva',
        description: 'The requested government or online application service is not available.',
      };
    }

    const supabase = await createClient();
    const { data: service } = await supabase
      .from('services')
      .select('name, fee, service_charge, estimated_days, prerequisites, steps, category_id')
      .ilike('slug', slug)
      .maybeSingle();

    if (!service) {
      return {
        title: 'Service Not Found | Sparsha Online Seva',
        description: 'The requested government or online application service is not available.',
      };
    }

    let categoryName = 'Government Services';
    if (service.category_id) {
      const { data: cat } = await supabase
        .from('categories')
        .select('name')
        .eq('id', service.category_id)
        .maybeSingle();
      if (cat?.name) {
        categoryName = cat.name;
      }
    }

    const title = `${service.name} Application & Required Documents Checklist | Sparsha Cyber Cafe`;
    const description =
      service.prerequisites ||
      service.steps ||
      `Apply for ${service.name} at Sparsha Cyber Cafe Aland. Check required documents checklist, govt official fees ₹${service.fee ?? 0}, service charges, and processing timeline.`;

    return {
      title,
      description,
      keywords: [
        service.name,
        categoryName,
        'Sparsha Cyber Cafe Aland',
        'Online Seva Kendra Aland',
        'Karnataka Online Applications',
        'Seva Sindhu Aland',
        'Required Documents Checklist',
        'Kalaburagi Cyber Cafe',
        'Online Form Submission Aland'
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
        images: [
          {
            url: `${SITE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: service.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${SITE_URL}/og-image.png`],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);
    return {
      title: 'Service Details | Sparsha Online Seva Aland',
      description: 'Online citizen application services and documentation checklist at Sparsha Cyber Cafe Aland.',
    };
  }
}

/**
 * Service Detail Main Server Component
 */
export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Fetch main service row
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .ilike('slug', slug)
    .maybeSingle();

  if (serviceError || !service) {
    console.error('Service lookup error:', slug, serviceError);
    notFound();
  }

  // 2. Fetch category record
  let categoryData = null;
  if (service.category_id) {
    try {
      const { data: cat } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', service.category_id)
        .maybeSingle();
      categoryData = cat;
    } catch (catErr) {
      console.error('Failed to load category:', catErr);
    }
  }

  // 3. Fetch required documents
  let requiredDocuments: any[] = [];
  try {
    const { data: docs } = await supabase
      .from('required_documents')
      .select('id, service_id, document_name, is_mandatory, notes, display_order')
      .eq('service_id', service.id)
      .order('display_order', { ascending: true });
    requiredDocuments = docs || [];
  } catch (docErr) {
    console.error('Failed to load required documents:', docErr);
  }

  // 4. Fetch service sample images
  let serviceImages: any[] = [];
  try {
    const { data: imgs } = await supabase
      .from('service_images')
      .select('id, service_id, image_url, caption, display_order')
      .eq('service_id', service.id)
      .order('display_order', { ascending: true });
    serviceImages = imgs || [];
  } catch (imgErr) {
    console.error('Failed to load service images:', imgErr);
  }

  // 5. Fetch related services from the same category
  let relatedServices: Array<{ id: string; name: string; slug: string; fee: number | null }> = [];
  if (service.category_id) {
    try {
      const { data: related } = await supabase
        .from('services')
        .select('id, name, slug, fee')
        .eq('category_id', service.category_id)
        .neq('id', service.id)
        .limit(4);
      relatedServices = related || [];
    } catch (relErr) {
      console.error('Failed to load related services:', relErr);
    }
  }

  // 6. Build Google Schema.org JSON-LD Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/services/${slug}#service`,
        name: service.name,
        serviceType: categoryData?.name || 'Citizen Application Service',
        description: service.prerequisites || service.steps || `${service.name} application processing assistance.`,
        provider: {
          '@type': 'LocalBusiness',
          name: SITE_NAME,
          telephone: SHOP_PHONE,
          address: {
            '@type': 'PostalAddress',
            streetAddress: SHOP_ADDRESS,
            addressLocality: 'Aland',
            addressRegion: 'Karnataka',
            postalCode: '585302',
            addressCountry: 'IN',
          },
          priceRange: '₹₹',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: (service.fee ?? 0) + (service.service_charge ?? 0),
          eligibleRegion: {
            '@type': 'State',
            name: 'Karnataka',
          },
        },
        termsOfService: `${SITE_URL}/services/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/services/${slug}#breadcrumb`,
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
            name: 'Services Catalog',
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
    required_documents: requiredDocuments,
    service_images: serviceImages,
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