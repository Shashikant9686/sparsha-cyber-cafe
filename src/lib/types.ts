export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface RequiredDocument {
  id: string;
  service_id: string;
  document_name: string;
  is_mandatory: boolean;
  description?: string | null;
  display_order: number;
  created_at?: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  image_url: string;
  alt_text?: string | null;
  display_order: number;
  created_at?: string;
}

export interface Service {
  id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  title?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  description?: string | null;
  submission_method?: string | null;
  fee?: number | null;
  service_charge?: number | null;
  processing_time?: string | null;
  prerequisites?: string | null;
  eligibility?: string | null;
  steps?: string | null;
  faq?: Json | null;
  status: 'active' | 'inactive' | 'draft' | string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  categories?: Category | null;
  required_documents?: RequiredDocument[];
  service_images?: ServiceImage[];
}

export interface RelatedServiceLink {
  id: string;
  name: string;
  slug: string;
  fee?: number | null;
}

export interface ServiceDetailData extends Service {
  relatedServices?: RelatedServiceLink[];
}

export interface EventDate {
  id?: string;
  counselling_event_id?: string;
  title: string;
  date_text: string;
  description?: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CounsellingEvent {
  id: string;
  service_id?: string | null;
  exam_type: string;
  title: string;
  academic_year: string;
  description?: string | null;
  official_portal_url?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  event_dates?: EventDate[];
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  start_date: string | null;
  last_date: string | null;
  official_link: string | null;
  status: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}