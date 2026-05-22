/** Public-site shell skeleton. Shown while any /(public) route streams. */
import PageSkeleton from '@/components/ui/PageSkeleton/PageSkeleton';

export default function PublicLoading() {
  return <PageSkeleton hero rows={8} />;
}
