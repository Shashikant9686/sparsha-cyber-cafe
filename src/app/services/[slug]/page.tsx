import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ServiceDetailClient from '@/components/services/ServiceDetailClient';

const SITE_NAME = 'Sparsha Cyber Cafe & Online Seva Kendra';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparsha-cyber-cafe.vercel.app';
const SHOP_PHONE = '+91 96861 68988';
const SHOP_ADDRESS = 'Main Road, Near Bus Stand, Aland, Kalaburagi District, Karnataka - 585302';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-generate static route parameters for all active services
 */
export async function generateStaticParams() {
  try {
    const supabase = await createClient();
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
    console.error('Static params generation error:', err);
    return [];
  }
}

/**
 * Generate rich SEO & OpenGraph Social metadata
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: service } = await supabase
      .from('services')
      .select('name, fee, service_charge, estimated_days, prerequisites, steps, category_id')
      .eq('slug', slug)
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

    const title = `${service.name} Online Application & Document Checklist | Sparsha Cyber Cafe`;
    const description =
      service.prerequisites ||
      service.steps ||
      `Apply for ${service.name} at Sparsha Cyber Cafe, Aland. Check required documents list, govt fees ₹${service.fee ?? 0}, service charges, and processing timeline.`;

    return {
      title,
      description,
      keywords: [
        service.name,
        categoryName,
        'Sparsha Cyber Cafe Aland',
        'Online Seva Kendra Aland',
        'Karnataka Online Applications',
        'Seva Sindhu Online Portal',
        'Required Documents Checklist',
        'Kalaburagi Cyber Cafe'
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
    console.error('Metadata generation error:', error);
    return {
      title: 'Service Details | Sparsha Online Seva Aland',
      description: 'Online services and application assistance at Sparsha Cyber Cafe Aland.',
    };
  }
}

/**
 * Service Detail Server Page Component
 */
export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Fetch Primary Service Entry
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (serviceError || !service) {
    notFound();
  }

  // 2. Fetch Category Record
  let categoryData = null;
  if (service.category_id) {
    try {
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('id', service.category_id)
        .maybeSingle();
      categoryData = cat;
    } catch (catErr) {
      console.error('Failed to load category:', catErr);
    }
  }

  // 3. Fetch Required Documents List
  let requiredDocuments: any[] = [];
  try {
    const { data: docs } = await supabase
      .from('required_documents')
      .select('*')
      .eq('service_id', service.id)
      .order('display_order', { ascending: true });
    requiredDocuments = docs || [];
  } catch (docErr) {
    console.error('Failed to load documents:', docErr);
  }

  // 4. Fetch Associated Service Sample Images
  let serviceImages: any[] = [];
  try {
    const { data: imgs } = await supabase
      .from('service_images')
      .select('*')
      .eq('service_id', service.id)
      .order('display_order', { ascending: true });
    serviceImages = imgs || [];
  } catch (imgErr) {
    console.error('Failed to load images:', imgErr);
  }

  // 5. Fetch Related Services in same category for suggestion section
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

  // 6. Build Rich Schema.org JSON-LD Structured Data
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