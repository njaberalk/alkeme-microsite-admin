import Anthropic from '@anthropic-ai/sdk';
import { getSite } from './sites.config';

let client;

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set. Add it to your Vercel environment variables or .env.local file.');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Vertical-specific context for each site
const verticalContext = {
  trucking: {
    topic: 'commercial trucking insurance',
    audience: 'owner-operators, fleet managers, and motor carriers',
    coverageSlugs: ['auto-liability', 'physical-damage', 'motor-truck-cargo', 'general-liability', 'non-trucking-liability', 'trailer-interchange', 'workers-compensation', 'umbrella-excess-liability', 'occupational-accident'],
    categories: ['Industry Insights', 'Tips & Advice', 'Claims Guide'],
  },
  towing: {
    topic: 'towing and roadside service insurance',
    audience: 'tow truck operators, roadside assistance companies, and recovery service businesses',
    coverageSlugs: ['auto-liability', 'on-hook-coverage', 'garagekeepers', 'garage-liability', 'physical-damage', 'general-liability', 'workers-compensation', 'umbrella-excess-liability', 'occupational-accident'],
    categories: ['Industry Insights', 'Tips & Advice', 'Claims Guide'],
  },
  cannabis: {
    topic: 'cannabis and marijuana business insurance',
    audience: 'dispensary owners, cultivators, manufacturers, and cannabis industry operators',
    coverageSlugs: ['general-liability', 'product-liability', 'property-insurance', 'crop-coverage', 'workers-compensation', 'commercial-auto', 'cyber-liability', 'directors-officers', 'umbrella-excess'],
    categories: ['Industry Insights', 'Compliance', 'Tips & Advice'],
  },
  hospitality: {
    topic: 'hospitality and restaurant insurance',
    audience: 'restaurant owners, hotel operators, bar owners, and event venue managers',
    coverageSlugs: ['general-liability', 'liquor-liability', 'property-insurance', 'workers-compensation', 'business-interruption', 'employment-practices', 'commercial-auto', 'umbrella-excess', 'cyber-liability', 'food-contamination'],
    categories: ['Industry Insights', 'Tips & Advice', 'Risk Management'],
  },
  construction: {
    topic: 'construction and contractor insurance',
    audience: 'general contractors, subcontractors, specialty trades, and construction firm owners',
    coverageSlugs: ['general-liability', 'workers-compensation', 'builders-risk', 'commercial-auto', 'inland-marine', 'professional-liability', 'surety-bonds', 'umbrella-excess', 'pollution-liability', 'subcontractor-default'],
    categories: ['Industry Insights', 'Tips & Advice', 'Compliance'],
  },
  'employee-benefits': {
    topic: 'employee benefits and group insurance',
    audience: 'HR directors, business owners, and benefits administrators',
    coverageSlugs: ['group-health-insurance', 'dental-insurance', 'vision-insurance', 'life-insurance', 'disability-insurance', 'retirement-plans', 'executive-benefits', 'voluntary-benefits', 'wellness-programs', 'compliance-administration'],
    categories: ['Industry Insights', 'Tips & Advice', 'HR Strategy', 'Trends'],
  },
  'business-insurance': {
    topic: 'commercial business insurance',
    audience: 'business owners, risk managers, and operations directors',
    coverageSlugs: ['general-liability', 'workers-compensation', 'commercial-property', 'business-interruption', 'professional-liability', 'commercial-auto', 'cyber-liability', 'directors-officers', 'umbrella-excess-liability', 'employment-practices-liability'],
    categories: ['Industry Insights', 'Tips & Advice', 'HR Strategy'],
  },
};

/**
 * Generate a blog post using Claude API
 * @param {string} siteId - Site vertical ID
 * @param {string} keyword - Target keyword
 * @param {string} topic - Optional topic/angle
 * @param {string[]} existingSlugs - Existing blog slugs to avoid duplicates
 * @returns {object} Blog post object matching the schema
 */
export async function generateBlogPost(siteId, keyword, topic, existingSlugs = []) {
  const site = getSite(siteId);
  const ctx = verticalContext[siteId];
  if (!site || !ctx) throw new Error(`Unknown site: ${siteId}`);

  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are an expert insurance content writer for ${site.brand} Insurance Services. You write authoritative, SEO-optimized blog articles about ${ctx.topic}.

Your audience is ${ctx.audience}.

You must return a valid JSON object (and nothing else — no markdown, no code fences, no explanation) that matches this exact schema:

{
  "slug": "kebab-case-url-slug",
  "title": "Article Title (50-70 chars)",
  "metaTitle": "SEO Title | ${site.brand} Insurance Services",
  "metaDescription": "150 char meta description with the target keyword",
  "category": "one of: ${ctx.categories.join(', ')}",
  "publishDate": "${today}",
  "heroHeading": "H1 Heading for the Page",
  "heroSubheading": "1-2 sentence subheading",
  "overview": "2-3 sentence overview paragraph",
  "sections": [
    { "heading": "Section Title", "content": "Multi-paragraph section content (2-3 paragraphs, each 3-5 sentences). Use simple language — target Flesch-Kincaid grade 8-10. Avoid jargon where possible." }
  ],
  "faqs": [
    { "q": "Question about the topic?", "a": "Detailed 2-3 sentence answer." }
  ],
  "relatedPosts": ["existing-blog-slug"],
  "relatedCoverages": ["coverage-slug"]
}

Requirements:
- 4-5 sections with multi-paragraph content
- 3 FAQs with detailed answers
- Naturally include the target keyword in title, overview, and at least 2 section headings
- relatedPosts must only reference existing slugs: ${JSON.stringify(existingSlugs)}
- relatedCoverages must only use slugs from: ${JSON.stringify(ctx.coverageSlugs)}
- slug must NOT match any existing slug
- Use short sentences (under 20 words). Use common words. Target grade 8-10 reading level.
- All content must be original and factually accurate`;

  const userPrompt = topic
    ? `Write a blog post targeting the keyword "${keyword}" with this angle: ${topic}`
    : `Write a blog post targeting the keyword "${keyword}"`;

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  const text = response.content[0].text.trim();

  // Parse the JSON response — handle potential markdown fences
  let json = text;
  if (json.startsWith('```')) {
    json = json.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const post = JSON.parse(json);

  // Validate required fields
  const required = ['slug', 'title', 'metaTitle', 'metaDescription', 'category', 'publishDate', 'heroHeading', 'heroSubheading', 'overview', 'sections', 'faqs'];
  for (const field of required) {
    if (!post[field]) throw new Error(`Generated post missing required field: ${field}`);
  }

  // Ensure slug doesn't conflict
  if (existingSlugs.includes(post.slug)) {
    post.slug = post.slug + '-' + Date.now().toString(36);
  }

  return post;
}
