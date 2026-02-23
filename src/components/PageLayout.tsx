import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import DemoBanner from '@/components/DemoBanner';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * PageLayout Component
 * 
 * A reusable layout wrapper that includes Header and Footer.
 * Ensures consistent layout across all pages with sticky footer behavior.
 * 
 * @example
 * ```tsx
 * <PageLayout className="bg-[#F5F3EF]">
 *   <YourContent />
 * </PageLayout>
 * ```
 */
export default function PageLayout({ 
  children, 
  className = '',
  showHeader = true,
  showFooter = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className={`flex-1 pt-14 md:pt-16 ${className}`}>
        {children}
      </main>
      {showFooter && (
        <>
          <Footer />
        </>
      )}
    </div>
  );
}
