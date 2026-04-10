import { notFound } from 'next/navigation';
import { sites } from '@/lib/sites.config';
import Sidebar from '@/components/Sidebar';

export async function generateStaticParams() {
  return Object.keys(sites).map((site) => ({ site }));
}

export default async function SiteLayout({ children, params }) {
  const { site } = await params;
  if (!sites[site]) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar siteId={site} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
