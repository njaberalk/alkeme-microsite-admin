'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sites, contentTypes } from '@/lib/sites.config';
import clsx from 'clsx';

export default function Sidebar({ siteId }) {
  const pathname = usePathname();
  const site = sites[siteId];
  if (!site) return null;

  const contentLinks = site.dataFiles
    .filter((f) => contentTypes[f])
    .map((f) => ({
      href: `/${siteId}/content/${f}`,
      label: contentTypes[f].label,
    }));

  const navGroups = [
    {
      title: 'Content',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      items: contentLinks,
    },
    {
      title: 'Components',
      icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
      items: site.components.map((c) => ({
        href: `/${siteId}/components/${c}`,
        label: c,
      })),
    },
    {
      title: 'Design',
      icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
      items: [{ href: `/${siteId}/theme`, label: 'Theme Editor' }],
    },
  ];

  return (
    <aside className="w-64 bg-sidebar text-white min-h-screen flex flex-col shrink-0">
      {/* Site Header */}
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="text-xs text-white/50 hover:text-white/80 transition-colors">
          &larr; All Sites
        </Link>
        <h2 className="font-bold mt-2 text-lg">{site.name}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
          {site.brand}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Dashboard link */}
        <Link
          href={`/${siteId}`}
          className={clsx(
            'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
            pathname === `/${siteId}`
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:text-white hover:bg-sidebar-hover'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>

        {/* Visual Editor link */}
        <Link
          href={`/${siteId}/visual-editor`}
          className={clsx(
            'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
            pathname === `/${siteId}/visual-editor`
              ? 'bg-blue-600/30 text-blue-300'
              : 'text-blue-400/70 hover:text-blue-300 hover:bg-blue-600/20'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Visual Editor
        </Link>

        {/* Page Builder link */}
        <Link
          href={`/${siteId}/builder`}
          className={clsx(
            'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
            pathname === `/${siteId}/builder`
              ? 'bg-emerald-600/30 text-emerald-300'
              : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-600/20'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655m5.254-4.218a5.14 5.14 0 00-7.071 7.071l.707.707L15.17 8.172l-.707-.707z" />
          </svg>
          Page Builder
        </Link>

        {navGroups.map((group) => (
          <div key={group.title} className="mt-6">
            <div className="flex items-center gap-2 px-4 mb-2">
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={group.icon} />
              </svg>
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                {group.title}
              </span>
            </div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'block px-4 py-1.5 pl-10 text-sm transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-sidebar-hover'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <a
          href={site.vercelUrl}
          target="_blank"
          rel="noopener"
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          View Live Site &rarr;
        </a>
      </div>
    </aside>
  );
}
