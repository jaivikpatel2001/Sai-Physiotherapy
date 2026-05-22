/** Article skeleton — covers the cold compile of /blog/[slug]. */
import PageSkeleton from '@/components/ui/PageSkeleton/PageSkeleton';

export default function BlogDetailLoading() {
  return <PageSkeleton variant="article" rows={10} />;
}
