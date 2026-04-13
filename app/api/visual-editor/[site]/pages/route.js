import { NextResponse } from 'next/server';
import { sites, contentTypes } from '@/lib/sites.config';
import { readFile } from '@/lib/github';
import { parseDataFile } from '@/lib/parser';

/**
 * Returns the full page tree for a site — all slugs and titles
 * organized by content type for the pages sidebar.
 */
export async function GET(request, { params }) {
  try {
    const { site } = await params;
    const siteConfig = sites[site];
    if (!siteConfig) return NextResponse.json({ error: 'Invalid site' }, { status: 404 });

    // Content types to load with their route prefixes
    const sections = [
      { key: 'coverages', label: 'Coverage', route: '/coverage', file: 'data/coverages.js', icon: 'shield' },
      { key: 'industries', label: 'Industries', route: '/industries', file: 'data/industries.js', icon: 'building' },
      { key: 'states-part1', label: 'States (A-M)', route: '/states', file: 'data/states-part1.js', icon: 'map', group: 'states' },
      { key: 'states-part2', label: 'States (N-W)', route: '/states', file: 'data/states-part2.js', icon: 'map', group: 'states' },
      { key: 'cities-part1', label: 'Cities (A-L)', route: '/cities', file: 'data/cities-part1.js', icon: 'pin', group: 'cities' },
      { key: 'cities-part2', label: 'Cities (M-Z)', route: '/cities', file: 'data/cities-part2.js', icon: 'pin', group: 'cities' },
      { key: 'resources', label: 'Resources', route: '/resources', file: 'data/resources.js', icon: 'book' },
      { key: 'blog', label: 'Blog', route: '/blog', file: 'data/blog.js', icon: 'pencil' },
    ];

    const tree = {
      home: { label: 'Home', route: '', pages: [{ slug: '', title: 'Homepage', route: '' }] },
    };

    // Load each section in parallel
    const results = await Promise.allSettled(
      sections.map(async (section) => {
        if (!siteConfig.dataFiles.includes(section.key)) return { section, pages: [] };
        try {
          const { content } = await readFile(siteConfig.repo, section.file);
          const parsed = parseDataFile(content);
          const items = Array.isArray(parsed.data) ? parsed.data : [];
          return {
            section,
            pages: items.map((item) => ({
              slug: item.slug,
              title: item.title || item.name || (item.city ? `${item.city}, ${item.abbreviation || item.state}` : null) || item.slug,
              route: `${section.route}/${item.slug}`,
              metaTitle: item.metaTitle,
              metaDescription: item.metaDescription,
            })),
          };
        } catch {
          return { section, pages: [] };
        }
      })
    );

    // Organize into tree, merging grouped sections (states-part1 + part2 → states)
    for (const result of results) {
      if (result.status !== 'fulfilled' || !result.value.pages.length) continue;
      const { section, pages } = result.value;
      const groupKey = section.group || section.key;

      if (tree[groupKey]) {
        // Merge into existing group
        tree[groupKey].pages.push(...pages);
      } else {
        tree[groupKey] = {
          label: section.group
            ? section.group.charAt(0).toUpperCase() + section.group.slice(1)
            : section.label,
          route: section.route,
          icon: section.icon,
          pages,
        };
      }
    }

    // Add tools section (static pages)
    if (site === 'trucking' || site === 'towing') {
      tree.tools = {
        label: 'Tools',
        route: '/tools',
        icon: 'wrench',
        pages: [
          { slug: 'fmcsa-checker', title: 'FMCSA Checker', route: '/tools/fmcsa-checker' },
          { slug: 'state-requirements', title: 'State Requirements', route: '/tools/state-requirements' },
        ],
      };
    }

    // Calculate total
    const totalPages = Object.values(tree).reduce((sum, s) => sum + s.pages.length, 0);

    return NextResponse.json({ tree, totalPages, site: siteConfig.name });
  } catch (error) {
    console.error('Pages tree error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
