import Header from '@/components/layout/Header/Header';
import Footer, { type FooterCmsLink } from '@/components/layout/Footer/Footer';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import MobileBottomNav from '@/components/layout/MobileBottomNav/MobileBottomNav';
import RouteProgress from '@/components/ui/RouteProgress';
import { getFooterPages } from '@/lib/cms';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const pages = await getFooterPages();
  const cmsLinks: FooterCmsLink[] = (pages ?? []).map((p) => ({
    slug: p.slug,
    label: p.footerLabel || p.title,
  }));

  return (
    <>
      <RouteProgress />
      <Header />
      <main>{children}</main>
      <Footer cmsLinks={cmsLinks} />
      <WhatsAppFloat />
      <MobileBottomNav />
    </>
  );
}
