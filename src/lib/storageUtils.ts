/**
 * Ensure a storage URL is safe to use in the browser.
 * Filters out internal bucket management endpoints that would
 * otherwise return 400 responses when used as image sources.
 */
export function getSafeStorageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Supabase bucket admin endpoints look like /storage/v1/bucket/<bucket>
  // They are not public objects and will 400 when fetched by the browser.
  if (trimmed.includes('/storage/v1/bucket/')) {
    return undefined;
  }

  return trimmed;
}
