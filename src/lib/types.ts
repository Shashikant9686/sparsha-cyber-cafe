export type SubmissionMethod = 'Online' | 'Physical' | 'Both';
export type ServiceStatus = 'Active' | 'Draft' | 'Archived';
export type AnnouncementType = 'flash' | 'popup' | 'banner';
export type AdminRole = 'superadmin' | 'admin' | 'operator';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface RequiredDocument {
  id: string;
  service_id: string;
  document_name: string;
  description: string | null;
  is_mandatory: boolean;
  display_order: number;
  created_at?: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  image_url: string;
  image_type?: string;
  alt_text: string | null;
  display_order: number;
  created_at?: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string | null;
  fee: string | null;
  service_charge: string | null;
  submission_method: SubmissionMethod;
  status: ServiceStatus;
  featured: boolean;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
  required_documents?: RequiredDocument[];
  service_images?: ServiceImage[];
}

export interface EventDate {
  id: string;
  counselling_event_id: string;
  title: string;
  date_text: string;
  description?: string | null;
  display_order: number;
  created_at?: string;
}

export interface CounsellingEvent {
  id: string;
  exam_type: 'KCET' | 'NEET' | 'JEE' | 'DCET' | 'Other';
  title: string;
  academic_year: string;
  description: string | null;
  official_portal_url: string | null;
  status: 'Active' | 'Round 1 Active' | 'Round 2 Active' | 'Mop-up Round' | 'Hidden';
  created_at?: string;
  updated_at?: string;
  event_dates?: EventDate[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  is_active: boolean;
  priority: number;
  link_url?: string | null;
  expires_at?: string | null;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}