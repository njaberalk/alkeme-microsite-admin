'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';

const sectionIcons = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  building: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  map: 'M9 6.75V15m0-8.25a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM3.375 3h17.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V4.125c0-.621.504-1.125 1.125-1.125z',
  pin: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  pencil: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  wrench: 'M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655m5.254-4.218a5.14 5.14 0 00-7.071 7.071l.707.707L15.17 8.172l-.707-.707z',
};

export default function PagesSidebar({ site, currentPath, onNavigate, onCreatePage }) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ home: true, coverages: true });
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetch(`/api/visual-editor/${site}/pages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tree) {
          setTree(data.tree);
          setTotalPages(data.totalPages || 0);
          // Auto-expand the section containing the current page
          for (const [key, section] of Object.entries(data.tree)) {
            if (section.pages?.some((p) => p.route === currentPath)) {
              setExpanded((prev) => ({ ...prev, [key]: true }));
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [site]);

  function toggleSection(key) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Filter pages by search
  function filterPages(pages) {
    if (!search) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q)
    );
  }

  if (loading) {
    return (
      <div className="w-[280px] bg-gray-950 text-white flex items-center justify-center shrink-0">
        <div className="text-gray-500 text-sm">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="w-[280px] bg-gray-950 text-white flex flex-col shrink-0 overflow-hidden border-r border-gray-800">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</span>
          <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{totalPages}</span>
        </div>
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tree */}
      <nav className="flex-1 overflow-y-auto py-1">
        {tree && Object.entries(tree).map(([key, section]) => {
          const filteredPages = filterPages(section.pages || []);
          if (search && filteredPages.length === 0) return null;

          const isExpanded = expanded[key] || !!search;
          const isHomeSection = key === 'home';
          const iconPath = sectionIcons[section.icon] || sectionIcons.building;

          return (
            <div key={key} className="mb-0.5">
              {/* Section header */}
              {isHomeSection ? (
                // Home is a single clickable item, not a section
                <button
                  onClick={() => onNavigate('')}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    currentPath === '' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                  )}
                >
                  <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={sectionIcons.home} />
                  </svg>
                  <span className="truncate">Home</span>
                </button>
              ) : (
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-900 transition-colors group"
                >
                  {/* Chevron */}
                  <svg
                    className={clsx('w-3 h-3 text-gray-600 transition-transform shrink-0', isExpanded && 'rotate-90')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 truncate flex-1">
                    {section.label}
                  </span>
                  <span className="text-[10px] text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded shrink-0">
                    {filteredPages.length}
                  </span>
                </button>
              )}

              {/* Section pages */}
              {!isHomeSection && isExpanded && (
                <div className="ml-5 border-l border-gray-800">
                  {filteredPages.map((page) => {
                    const isActive = currentPath === page.route;
                    return (
                      <button
                        key={page.slug || page.route}
                        onClick={() => onNavigate(page.route)}
                        className={clsx(
                          'w-full text-left pl-4 pr-3 py-1 text-[12px] transition-colors truncate block',
                          isActive
                            ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 -ml-px'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
                        )}
                        title={page.title}
                      >
                        {page.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Create Page Button */}
      <div className="px-3 py-3 border-t border-gray-800">
        <button
          onClick={onCreatePage}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Page
        </button>
      </div>
    </div>
  );
}
