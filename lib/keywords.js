import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const KEYWORDS_DIR = join(process.cwd(), '.data', 'keywords');

// Ensure directory exists
function ensureDir() {
  if (!existsSync(KEYWORDS_DIR)) {
    mkdirSync(KEYWORDS_DIR, { recursive: true });
  }
}

function getFilePath(siteId) {
  return join(KEYWORDS_DIR, `${siteId}.json`);
}

/**
 * Get stored keywords for a site
 * @param {string} siteId
 * @returns {Array<{keyword: string, volume: number, difficulty: number, cpc: number}>}
 */
export function getKeywords(siteId) {
  ensureDir();
  const filePath = getFilePath(siteId);
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * Save keywords for a site
 * @param {string} siteId
 * @param {Array} keywords
 */
export function saveKeywords(siteId, keywords) {
  ensureDir();
  writeFileSync(getFilePath(siteId), JSON.stringify(keywords, null, 2));
}

/**
 * Parse Ahrefs CSV export into keyword objects
 * Handles common Ahrefs export formats:
 * - Keyword, Volume, KD, CPC
 * - Keyword, Search Volume, Keyword Difficulty, CPC (USD)
 * @param {string} csvText - Raw CSV text
 * @returns {Array<{keyword: string, volume: number, difficulty: number, cpc: number}>}
 */
export function parseAhrefsCsv(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header to find column indices
  const header = lines[0].toLowerCase();
  const cols = header.split(',').map(c => c.trim().replace(/"/g, ''));

  const keywordIdx = cols.findIndex(c => c === 'keyword' || c === 'term' || c === 'query');
  const volumeIdx = cols.findIndex(c => c.includes('volume') || c === 'vol');
  const difficultyIdx = cols.findIndex(c => c.includes('difficulty') || c === 'kd' || c === 'kd%');
  const cpcIdx = cols.findIndex(c => c.includes('cpc') || c.includes('cost'));

  if (keywordIdx === -1) {
    // Try tab-separated
    const tabCols = header.split('\t').map(c => c.trim().replace(/"/g, ''));
    if (tabCols.length > 1) {
      return parseTabSeparated(lines, tabCols);
    }
    throw new Error('Could not find keyword column in CSV. Expected a "Keyword" column header.');
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

  // Sort by volume descending
  return keywords.sort((a, b) => b.volume - a.volume);
}

function parseTabSeparated(lines, cols) {
  const keywordIdx = cols.findIndex(c => c === 'keyword' || c === 'term' || c === 'query');
  const volumeIdx = cols.findIndex(c => c.includes('volume') || c === 'vol');
  const difficultyIdx = cols.findIndex(c => c.includes('difficulty') || c === 'kd');
  const cpcIdx = cols.findIndex(c => c.includes('cpc') || c.includes('cost'));

  const keywords = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t').map(v => v.trim().replace(/"/g, ''));
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

// Simple CSV line parser that handles quoted values
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}
