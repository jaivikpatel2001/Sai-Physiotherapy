/**
 * Root-level loading fallback. Streamed by Next.js whenever a route segment
 * is compiling/data-fetching and there's no nested `loading.tsx` closer to
 * the leaf. Server component — zero client JS.
 */
import PageSkeleton from '@/components/ui/PageSkeleton/PageSkeleton';

export default function RootLoading() {
  return <PageSkeleton hero rows={6} />;
}
