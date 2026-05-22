/** CMS page skeleton — covers cold compile of /[slug] (privacy, terms, etc.) */
import PageSkeleton from '@/components/ui/PageSkeleton/PageSkeleton';

export default function CmsPageLoading() {
  return <PageSkeleton variant="article" rows={12} />;
}
