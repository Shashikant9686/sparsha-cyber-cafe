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
  notes?: string | null;
  display_order: number;
  created_at?: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  image_url: string;
  caption?: string | null;
  display_order: number;
  created_at?: string;
}

export interface Service {
  id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  submission_method?: string | null;
  fee?: number | null;
  service_charge?: number | null;
  estimated_days?: string | null;
  prerequisites?: string | null;
  steps?: string | null;
  faq?: Json | null;
  status: 'active' | 'inactive' | 'draft';
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  categories?: Category | null;
  required_documents?: RequiredDocument[];
  service_images?: ServiceImage[];
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
  message: string;
  link_url?: string | null;
  is_active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}