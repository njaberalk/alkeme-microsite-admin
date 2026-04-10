export const sites = {
  trucking: {
    id: 'trucking',
    name: 'Trucking Insurance',
    repo: 'njaberalk/alkeme-trucking-insurance',
    basePath: '/trucking',
    brand: 'ALKEME',
    vercelUrl: 'https://trucking-nextjs.vercel.app',
    color: '#25475e',
    dataFiles: [
      'coverages', 'industries', 'resources', 'blog',
      'states-part1', 'states-part2', 'cities-part1', 'cities-part2',
      'cross-links', 'state-requirements', 'fmcsa-requirements',
    ],
    components: [
      'Hero', 'FAQ', 'WhyChooseUs', 'Process', 'Stats',
      'Testimonial', 'ValueProposition', 'QuoteForm', 'Header', 'Footer',
    ],
  },
  towing: {
    id: 'towing',
    name: 'Towing Insurance',
    repo: 'njaberalk/alkeme-towing-insurance',
    basePath: '/towing',
    brand: 'ALKEME',
    vercelUrl: 'https://towing-nextjs.vercel.app',
    color: '#25475e',
    dataFiles: [
      'coverages', 'industries', 'resources', 'blog',
      'states-part1', 'states-part2', 'cities-part1', 'cities-part2',
      'cross-links', 'state-requirements', 'fmcsa-requirements',
    ],
    components: [
      'Hero', 'FAQ', 'WhyChooseUs', 'Process', 'Stats',
      'Testimonial', 'ValueProposition', 'QuoteForm', 'Header', 'Footer',
    ],
  },
  hospitality: {
    id: 'hospitality',
    name: 'Hospitality Insurance',
    repo: 'njaberalk/alkeme-hospitality-insurance',
    basePath: '/hospitality',
    brand: 'ALKEME',
    vercelUrl: 'https://hosp-chi.vercel.app',
    color: '#25475e',
    dataFiles: [
      'coverages', 'industries', 'resources', 'blog',
      'states-part1', 'states-part2', 'cities-part1', 'cities-part2',
      'cross-links',
    ],
    components: [
      'Hero', 'FAQ', 'WhyChooseUs', 'Process', 'Stats',
      'Testimonial', 'ValueProposition', 'QuoteForm', 'Header', 'Footer',
    ],
  },
  construction: {
    id: 'construction',
    name: 'Construction Insurance',
    repo: 'njaberalk/alkeme-construction-insurance',
    basePath: '/construction',
    brand: 'ALKEME',
    vercelUrl: 'https://const-kappa.vercel.app',
    color: '#25475e',
    dataFiles: [
      'coverages', 'industries', 'resources', 'blog',
      'states-part1', 'states-part2', 'cities-part1', 'cities-part2',
      'cross-links',
    ],
    components: [
      'Hero', 'FAQ', 'WhyChooseUs', 'Process', 'Stats',
      'Testimonial', 'ValueProposition', 'QuoteForm', 'Header', 'Footer',
    ],
  },
  cannabis: {
    id: 'cannabis',
    name: 'Cannabis Insurance',
    repo: 'njaberalk/canopyshield-cannabis-insurance',
    basePath: '/cannabis',
    brand: 'CanopyShield',
    vercelUrl: 'https://cannabis-nextjs.vercel.app',
    color: '#2d5016',
    dataFiles: [
      'coverages', 'industries', 'resources', 'blog',
      'states-part1', 'states-part2', 'cities-part1', 'cities-part2',
      'cross-links',
    ],
    components: [
      'Hero', 'FAQ', 'WhyChooseUs', 'Process', 'Stats',
      'Testimonial', 'ValueProposition', 'QuoteForm', 'Header', 'Footer',
    ],
  },
};

export const siteIds = Object.keys(sites);

export function getSite(id) {
  return sites[id] || null;
}

// Content types that all sites share
export const contentTypes = {
  coverages: { label: 'Coverages', exportName: 'coverages', file: 'data/coverages.js' },
  industries: { label: 'Industries', exportName: 'industries', file: 'data/industries.js' },
  resources: { label: 'Resources', exportName: 'resources', file: 'data/resources.js' },
  blog: { label: 'Blog Posts', exportName: 'blogPosts', file: 'data/blog.js' },
  'states-part1': { label: 'States (A-M)', exportName: 'statesPart1', file: 'data/states-part1.js' },
  'states-part2': { label: 'States (N-W)', exportName: 'statesPart2', file: 'data/states-part2.js' },
  'cities-part1': { label: 'Cities (A-L)', exportName: 'citiesPart1', file: 'data/cities-part1.js' },
  'cities-part2': { label: 'Cities (M-Z)', exportName: 'citiesPart2', file: 'data/cities-part2.js' },
  'cross-links': { label: 'Cross Links', exportName: null, file: 'data/cross-links.js' },
  'state-requirements': { label: 'State Requirements', exportName: 'stateRequirements', file: 'data/state-requirements.js' },
  'fmcsa-requirements': { label: 'FMCSA Requirements', exportName: 'fmcsaRequirements', file: 'data/fmcsa-requirements.js' },
};
