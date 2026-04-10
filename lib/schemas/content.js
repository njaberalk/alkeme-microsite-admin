import { z } from 'zod';

const sectionSchema = z.object({
  heading: z.string().min(1, 'Heading required'),
  content: z.string().optional().default(''),
  bullets: z.array(z.string()).optional(),
});

const faqSchema = z.object({
  q: z.string().min(1, 'Question required'),
  a: z.string().min(1, 'Answer required'),
});

export const coverageSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  title: z.string().min(1, 'Title required'),
  metaTitle: z.string().min(1, 'Meta title required'),
  metaDescription: z.string().min(1, 'Meta description required').max(160),
  heroHeading: z.string().min(1),
  heroSubheading: z.string().optional().default(''),
  overview: z.string().min(1, 'Overview required'),
  sections: z.array(sectionSchema).min(1, 'At least one section required'),
  faqs: z.array(faqSchema).optional().default([]),
  relatedCoverages: z.array(z.string()).optional().default([]),
  recommendedCoverages: z.array(z.string()).optional().default([]),
});

export const industrySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1).max(160),
  heroHeading: z.string().min(1),
  heroSubheading: z.string().optional().default(''),
  overview: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
  faqs: z.array(faqSchema).optional().default([]),
  relatedCoverages: z.array(z.string()).optional().default([]),
  recommendedCoverages: z.array(z.string()).optional().default([]),
});

export const resourceSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1).max(160),
  heroHeading: z.string().min(1),
  heroSubheading: z.string().optional().default(''),
  overview: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
  faqs: z.array(faqSchema).optional().default([]),
});

export const blogSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1).max(160),
  heroHeading: z.string().min(1),
  heroSubheading: z.string().optional().default(''),
  overview: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
  faqs: z.array(faqSchema).optional().default([]),
});

export const stateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1).max(160),
  heroHeading: z.string().min(1),
  heroSubheading: z.string().optional().default(''),
  overview: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
  faqs: z.array(faqSchema).optional().default([]),
});

export const citySchema = stateSchema;

// Component data schemas
export const faqComponentSchema = z.array(
  z.object({ q: z.string().min(1), a: z.string().min(1) })
);

export const statsComponentSchema = z.array(
  z.object({
    value: z.string().min(1),
    label: z.string().min(1),
  })
);

export const processComponentSchema = z.array(
  z.object({
    step: z.string().optional(),
    title: z.string().min(1),
    description: z.string().min(1),
  })
);

export const heroComponentSchema = z.object({
  headline: z.string().min(1),
  subtitle: z.string().min(1),
  ctaText: z.string().min(1),
  ctaLink: z.string().min(1),
});

// Map content type to schema
export function getSchemaForType(type) {
  const map = {
    coverages: coverageSchema,
    industries: industrySchema,
    resources: resourceSchema,
    blog: blogSchema,
    'states-part1': stateSchema,
    'states-part2': stateSchema,
    'cities-part1': citySchema,
    'cities-part2': citySchema,
  };
  return map[type] || null;
}
