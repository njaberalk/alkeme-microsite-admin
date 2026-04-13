'use client';

import { usePathname } from 'next/navigation';
import { sites } from '@/lib/sites.config';
import Sidebar from '@/components/Sidebar';

export default function SiteLayout({ children, params }) {
  const pathname = usePathname();
  const isVisualEditor = pathname.endsWith('/visual-editor');

  // Visual editor gets full screen — no sidebar
  if (isVisualEditor) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar siteId={pathname.split('/')[1]} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
