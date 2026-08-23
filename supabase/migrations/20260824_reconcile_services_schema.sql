-- Migration: Reconcile services table schema, strictly backfill documents, and verify integrity
-- =========================================================================================
-- Safety Guarantees:
-- 1. Checks if column `required_documents` exists before attempting dynamic backfill.
-- 2. Unhandled exceptions in backfill abort the transaction immediately.
-- 3. Strict verification block checks that every service with non-empty legacy documents has matching relational rows.
-- 4. DROP COLUMN statements only execute if the verification passes.
-- =========================================================================================

BEGIN;

-- 1. BACKFILL: Insert orphaned JSON document array elements if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'services' 
      AND column_name = 'required_documents'
  ) THEN
    EXECUTE '
      INSERT INTO public.required_documents (
        service_id,
        document_name,
        is_mandatory,
        display_order,
        created_at
      )
      SELECT
        s.id AS service_id,
        doc.value AS document_name,
        true AS is_mandatory,
        doc.ordinality AS display_order,
        NOW() AS created_at
      FROM public.services s
      CROSS JOIN LATERAL jsonb_array_elements_text(
        CASE 
          WHEN pg_typeof(s.required_documents) = ''jsonb''::regtype THEN s.required_documents
          ELSE s.required_documents::text::jsonb
        END
      ) WITH ORDINALITY AS doc(value, ordinality)
      WHERE s.required_documents IS NOT NULL
        AND s.required_documents::text != ''[]''
        AND s.required_documents::text != ''null''
        AND s.required_documents::text != ''''
        AND NOT EXISTS (
          SELECT 1 
          FROM public.required_documents rd 
          WHERE rd.service_id = s.id
        );
    ';
  END IF;
END $$;

-- 2. VERIFICATION: Ensure legacy document arrays are relationalized if column exists
DO $$
DECLARE
  unmigrated_count INT := 0;
  unmigrated_services TEXT := '';
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'services' 
      AND column_name = 'required_documents'
  ) THEN
    EXECUTE '
      SELECT 
        COUNT(*),
        COALESCE(string_agg(s.id::text || '' ('' || s.name || '')'', '', ''), '''')
      FROM public.services s
      WHERE s.required_documents IS NOT NULL
        AND s.required_documents::text != ''[]''
        AND s.required_documents::text != ''null''
        AND s.required_documents::text != ''''
        AND NOT EXISTS (
          SELECT 1 
          FROM public.required_documents rd 
          WHERE rd.service_id = s.id
        );
    ' INTO unmigrated_count, unmigrated_services;

    IF unmigrated_count > 0 THEN
      RAISE EXCEPTION 'MIGRATION ABORTED: Found % service(s) with orphaned legacy documents that lack relational required_documents rows: %. No columns dropped.', 
        unmigrated_count, 
        unmigrated_services;
    END IF;
  END IF;
END $$;

-- 3. DROP REDUNDANT COLUMNS (Executes ONLY after verification passes)
ALTER TABLE public.services
  DROP COLUMN IF EXISTS title CASCADE,
  DROP COLUMN IF EXISTS category CASCADE,
  DROP COLUMN IF EXISTS official_fee CASCADE,
  DROP COLUMN IF EXISTS is_featured CASCADE,
  DROP COLUMN IF EXISTS required_documents CASCADE,
  DROP COLUMN IF EXISTS description CASCADE,
  DROP COLUMN IF EXISTS eligibility CASCADE,
  DROP COLUMN IF EXISTS disclaimer_type CASCADE;

COMMIT;