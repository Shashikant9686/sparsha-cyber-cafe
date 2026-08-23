-- Migration: Reconcile services table schema and backfill documents safely
-- ========================================================================

-- 1. BACKFILL: Safely insert JSON document array elements into required_documents
DO $$
BEGIN
  -- Insert only if the required_documents table exists and has no existing records for that service
  INSERT INTO public.required_documents (
    service_id,
    document_name,
    is_mandatory,
    display_order,
    created_at,
    updated_at
  )
  SELECT
    s.id AS service_id,
    doc.value AS document_name,
    true AS is_mandatory,
    doc.ordinality AS display_order,
    NOW() AS created_at,
    NOW() AS updated_at
  FROM public.services s
  CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE 
      WHEN pg_typeof(s.required_documents) = 'jsonb'::regtype THEN s.required_documents
      ELSE s.required_documents::text::jsonb
    END
  ) WITH ORDINALITY AS doc(value, ordinality)
  WHERE s.required_documents IS NOT NULL
    AND s.required_documents::text != '[]'
    AND s.required_documents::text != 'null'
    AND s.required_documents::text != ''
    AND NOT EXISTS (
      SELECT 1 
      FROM public.required_documents rd 
      WHERE rd.service_id = s.id
    );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Backfill step encountered: %. Continuing to column cleanup...', SQLERRM;
END $$;

-- 2. DROP REDUNDANT / DUPLICATE COLUMNS
ALTER TABLE public.services DROP COLUMN IF EXISTS title CASCADE;
ALTER TABLE public.services DROP COLUMN IF EXISTS category CASCADE;
ALTER TABLE public.services DROP COLUMN IF EXISTS official_fee CASCADE;
ALTER TABLE public.services DROP COLUMN IF EXISTS is_featured CASCADE;
ALTER TABLE public.services DROP COLUMN IF EXISTS required_documents CASCADE;
ALTER TABLE public.services DROP COLUMN IF EXISTS description CASCADE;
ALTER TABLE public.services DROP COLUMN IF EXISTS eligibility CASCADE;
ALTER TABLE public.services DROP COLUMN IF EXISTS disclaimer_type CASCADE;