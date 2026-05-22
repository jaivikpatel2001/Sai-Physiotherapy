/** Service-detail skeleton — covers the cold compile of /services/[slug]. */
import PageSkeleton from '@/components/ui/PageSkeleton/PageSkeleton';

export default function ServiceDetailLoading() {
  return <PageSkeleton variant="article" rows={8} />;
}
