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