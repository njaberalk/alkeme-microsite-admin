import { NextResponse } from 'next/server';
import { sites, contentTypes } from '@/lib/sites.config';
import { readFile, writeFile } from '@/lib/github';
import { parseDataFile, serializeDataFile } from '@/lib/parser';

export async function POST(request, { params }) {
  try {
    const { site } = await params;
    const body = await request.json();
    const { type, title, slug } = body;

    const siteConfig = sites[site];
    if (!siteConfig) return NextResponse.json({ error: 'Invalid site' }, { status: 404 });
    if (!type || !title || !slug) return NextResponse.json({ error: 'type, title, and slug required' }, { status: 400 });

    const typeConfig = contentTypes[type];
    if (!typeConfig) return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });

    // Read current data file
    const branch = siteConfig.branch || 'master';
    const { content, sha } = await readFile(siteConfig.repo, typeConfig.file, branch);
    const parsed = parseDataFile(content);
    const items = Array.isArray(parsed.data) ? parsed.data : [];

    // Check for duplicate slug
    if (items.some((i) => i.slug === slug)) {
      return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });
    }

    // Auto-generate the new item
    const vertical = siteConfig.name.replace(' Insurance', '');
    const newItem = {
      slug,
      title,
      metaTitle: `${title} Insurance | ${siteConfig.brand}`,
      metaDescription: `Learn about ${title.toLowerCase()} insurance for ${vertical.toLowerCase()} businesses. Get expert coverage and a free quote from ${siteConfig.brand}.`,
      heroHeading: `${title} Insurance`,
      heroSubheading: `Comprehensive ${title.toLowerCase()} coverage tailored for ${vertical.toLowerCase()} businesses and operations.`,
      overview: `${title} insurance is essential for ${vertical.toLowerCase()} businesses. This coverage protects your operation from the unique risks associated with ${title.toLowerCase()}, helping you focus on running your business with confidence.`,
      sections: [
        {
          heading: 'What This Coverage Includes',
          content: `${title} insurance provides protection against the key risks facing ${vertical.toLowerCase()} businesses. Understanding what your policy covers helps you make informed decisions about your risk management strategy.`,
        },
        {
          heading: 'Who Needs This Coverage',
          content: `Most ${vertical.toLowerCase()} businesses benefit from ${title.toLowerCase()} insurance. Whether you are just starting out or have been in the industry for years, this coverage provides the financial protection you need.`,
        },
        {
          heading: 'Key Benefits',
          content: '',
          bullets: [
            `Comprehensive protection tailored to ${vertical.toLowerCase()} operations`,
            'Expert claims handling and support',
            'Competitive premium rates',
            'Flexible policy options to match your needs',
          ],
        },
      ],
      faqs: [
        {
          q: `What does ${title.toLowerCase()} insurance cover?`,
          a: `${title} insurance covers the specific risks associated with ${vertical.toLowerCase()} businesses, including liability claims, property damage, and other operational exposures unique to your industry.`,
        },
        {
          q: `How much does ${title.toLowerCase()} insurance cost?`,
          a: `The cost depends on factors like your business size, location, claims history, and coverage limits. Contact us for a personalized quote tailored to your specific needs.`,
        },
      ],
    };

    // Add state/city-specific fields
    if (type.includes('states')) {
      newItem.name = title;
      delete newItem.title;
      newItem.abbreviation = body.abbreviation || '';
    }
    if (type.includes('cities')) {
      newItem.city = title;
      newItem.state = body.state || '';
      newItem.abbreviation = body.abbreviation || '';
      newItem.stateSlug = (body.state || '').toLowerCase().replace(/\s+/g, '-');
      delete newItem.title;
    }

    // Trim meta description if too long
    if (newItem.metaDescription.length > 160) {
      newItem.metaDescription = newItem.metaDescription.slice(0, 157) + '...';
    }
    if (newItem.metaTitle.length > 60) {
      newItem.metaTitle = newItem.metaTitle.slice(0, 57) + '...';
    }

    // Add to items
    items.push(newItem);

    // Serialize and write back
    const newContent = serializeDataFile(parsed.primaryExport, items);
    const result = await writeFile(
      siteConfig.repo,
      typeConfig.file,
      newContent,
      sha,
      `CMS: Create new ${type}/${slug}`, branch,
    );

    // Determine the route for navigation
    const routeMap = {
      coverages: '/coverage', industries: '/industries', resources: '/resources',
      blog: '/blog', 'states-part1': '/states', 'states-part2': '/states',
      'cities-part1': '/cities', 'cities-part2': '/cities',
    };
    const route = `${routeMap[type] || '/' + type}/${slug}`;

    return NextResponse.json({ success: true, route, slug, sha: result.sha });
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
