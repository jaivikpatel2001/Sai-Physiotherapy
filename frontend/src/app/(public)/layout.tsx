import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import MobileBottomNav from '@/components/layout/MobileBottomNav/MobileBottomNav';
import RouteProgress from '@/components/ui/RouteProgress';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteProgress />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MobileBottomNav />
    </>
  );
}
