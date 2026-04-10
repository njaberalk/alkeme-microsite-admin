import { NextResponse } from 'next/server';
import { sites } from '@/lib/sites.config';
import { readFile, writeFile } from '@/lib/github';
import { extractComponentData, replaceComponentData } from '@/lib/component-parser';

// Map component names to their variable names and file paths
const componentMap = {
  FAQ: { file: 'components/FAQ.jsx', vars: ['faqs'] },
  WhyChooseUs: { file: 'components/WhyChooseUs.jsx', vars: ['points', 'reasons'] },
  Process: { file: 'components/Process.jsx', vars: ['steps'] },
  Stats: { file: 'components/Stats.jsx', vars: ['stats'] },
  Testimonial: { file: 'components/Testimonial.jsx', vars: ['testimonial', 'quote'] },
  ValueProposition: { file: 'components/ValueProposition.jsx', vars: ['cards', 'propositions'] },
  Hero: { file: 'components/Hero.jsx', vars: ['heroData'] },
  QuoteForm: { file: 'components/QuoteForm.jsx', vars: ['formConfig'] },
  Header: { file: 'components/Header.jsx', vars: ['navLinks', 'coverageLinks', 'industryLinks'] },
  Footer: { file: 'components/Footer.jsx', vars: ['footerLinks', 'coverageLinks', 'industryLinks', 'resourceLinks'] },
};

export async function GET(request, { params }) {
  try {
    const { site, name } = await params;
    const siteConfig = sites[site];
    if (!siteConfig) {
      return NextResponse.json({ error: 'Invalid site' }, { status: 404 });
    }

    const compConfig = componentMap[name];
    if (!compConfig) {
      return NextResponse.json({ error: `Unknown component: ${name}` }, { status: 404 });
    }

    const { content, sha } = await readFile(siteConfig.repo, compConfig.file);

    // Try each variable name until we find data
    const results = {};
    for (const varName of compConfig.vars) {
      const extracted = extractComponentData(content, varName);
      if (extracted) {
        results[varName] = extracted.data;
      }
    }

    return NextResponse.json({
      component: name,
      file: compConfig.file,
      data: results,
      sha,
      source: content,
    });
  } catch (error) {
    console.error('Component get error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { site, name } = await params;
    const body = await request.json();
    const { varName, data, sha } = body;

    const siteConfig = sites[site];
    const compConfig = componentMap[name];
    if (!siteConfig || !compConfig) {
      return NextResponse.json({ error: 'Invalid site or component' }, { status: 404 });
    }

    const { content } = await readFile(siteConfig.repo, compConfig.file);
    const newContent = replaceComponentData(content, varName, data);

    const result = await writeFile(
      siteConfig.repo,
      compConfig.file,
      newContent,
      sha,
      `CMS: Update ${name} component`,
    );

    return NextResponse.json({ success: true, sha: result.sha });
  } catch (error) {
    console.error('Component save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
