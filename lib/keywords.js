import { readFile, writeFile } from './github.js';
import { getSite } from './sites.config.js';

const KEYWORDS_PATH = 'cms-keywords.json';

/**
 * Get stored keywords for a site.
 * Reads from the site's GitHub repo (persistent across deploys).
 */
export async function getKeywords(siteId) {
  const site = getSite(siteId);
  if (!site) return [];
  try {
    const { content } = await readFile(site.repo, KEYWORDS_PATH, site.branch || 'master');
    return JSON.parse(content);
  } catch {
    return []; // File doesn't exist yet
  }
}

/**
 * Save keywords for a site.
 * Writes to the site's GitHub repo.
 */
export async function saveKeywords(siteId, keywords) {
  const site = getSite(siteId);
  if (!site) return;

  let sha = null;
  try {
    const existing = await readFile(site.repo, KEYWORDS_PATH, site.branch || 'master');
    sha = existing.sha;
  } catch {
    // File doesn't exist yet — will create
  }

  await writeFile(
    site.repo,
    KEYWORDS_PATH,
    JSON.stringify(keywords, null, 2),
    sha,
    'CMS: Update keyword database',
    site.branch || 'master'
  );
}

/**
 * Parse Ahrefs/SEMrush CSV export into keyword objects.
 * Handles multiple CSV formats and tab-separated files.
 */
export function parseAhrefsCsv(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const cols = header.split(',').map((c) => c.trim().replace(/"/g, ''));

  const keywordIdx = cols.findIndex((c) => c === 'keyword' || c === 'term' || c === 'query');
  const volumeIdx = cols.findIndex((c) => c.includes('volume') || c === 'vol');
  const difficultyIdx = cols.findIndex((c) => c.includes('difficulty') || c === 'kd' || c === 'kd%');
  const cpcIdx = cols.findIndex((c) => c.includes('cpc') || c.includes('cost'));

  if (keywordIdx === -1) {
    // Try tab-separated
    const tabCols = header.split('\t').map((c) => c.trim().replace(/"/g, ''));
    if (tabCols.length > 1) return parseTabSeparated(lines, tabCols);
    throw new Error('Could not find keyword column. Expected a "Keyword" column header.');
  }

  const keywords = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (!values[keywordIdx]) continue;
    keywords.push({
      keyword: values[keywordIdx].trim(),
      volume: volumeIdx >= 0 ? parseInt(values[volumeIdx]) || 0 : 0,
      difficulty: difficultyIdx >= 0 ? parseInt(values[difficultyIdx]) || 0 : 0,
      cpc: cpcIdx >= 0 ? parseFloat(values[cpcIdx]) || 0 : 0,
    });
  }
  return keywords.sort((a, b) => b.volume - a.volume);
}

function parseTabSeparated(lines, cols) {
  const keywordIdx = cols.findIndex((c) => c === 'keyword' || c === 'term' || c === 'query');
  const volumeIdx = cols.findIndex((c) => c.includes('volume') || c === 'vol');
  const difficultyIdx = cols.findIndex((c) => c.includes('difficulty') || c === 'kd');
  const cpcIdx = cols.findIndex((c) => c.includes('cpc') || c.includes('cost'));

  const keywords = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t').map((v) => v.trim().replace(/"/g, ''));
    if (!values[keywordIdx]) continue;
    keywords.push({
      keyword: values[keywordIdx],
      volume: volumeIdx >= 0 ? parseInt(values[volumeIdx]) || 0 : 0,
      difficulty: difficultyIdx >= 0 ? parseInt(values[difficultyIdx]) || 0 : 0,
      cpc: cpcIdx >= 0 ? parseFloat(values[cpcIdx]) || 0 : 0,
    });
  }
  return keywords.sort((a, b) => b.volume - a.volume);
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
    else current += ch;
  }
  values.push(current.trim());
  return values;
}
