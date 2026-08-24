/**
 * Extracts the storage-relative path from a Supabase Storage public URL, so it
 * can be passed to supabase.storage.from(bucket).remove([path]).
 * Public URLs look like:
 *   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 * Returns null if the URL doesn't match the expected shape (e.g. an external
 * URL that was pasted in manually rather than uploaded) — callers should skip
 * deletion in that case rather than attempt to remove something we can't
 * safely identify as ours.
 */
export function extractStoragePath(publicUrl: string, bucketName: string): string | null {
  const marker = `/storage/v1/object/public/${bucketName}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return publicUrl.slice(index + marker.length);
}