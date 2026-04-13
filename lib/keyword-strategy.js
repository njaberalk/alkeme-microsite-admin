/**
 * Keyword Strategy Engine
 * Priority scoring, clustering, and smart keyword selection.
 */

/**
 * Score a keyword's priority for targeting.
 * Higher = should target sooner.
 * Factors: search volume (60%), inverse difficulty (40%), CPC bonus.
 */
export function scorePriority(kw) {
  const vol = Math.min(kw.volume || 0, 10000); // cap to prevent outliers
  const diff = kw.difficulty || 50;
  const cpc = kw.cpc || 0;
  return Math.round((vol * 0.006) + ((100 - diff) * 0.4) + (cpc * 2));
}

/**
 * Cluster keywords by word overlap.
 * Keywords sharing >50% of their words get grouped together.
 * Returns: { clusterName: [keyword, ...], ... }
 */
export function clusterKeywords(keywords) {
  const clusters = {};
  const assigned = new Set();

  // Sort by volume desc so high-volume keywords name the cluster
  const sorted = [...keywords].sort((a, b) => (b.volume || 0) - (a.volume || 0));

  for (const kw of sorted) {
    if (assigned.has(kw.keyword)) continue;

    const words = getWords(kw.keyword);
    const clusterName = kw.keyword;
    const cluster = [kw];
    assigned.add(kw.keyword);

    // Find similar keywords
    for (const other of sorted) {
      if (assigned.has(other.keyword)) continue;
      const otherWords = getWords(other.keyword);
      const overlap = wordOverlap(words, otherWords);
      if (overlap >= 0.5) {
        cluster.push(other);
        assigned.add(other.keyword);
      }
    }

    clusters[clusterName] = cluster;
  }

  return clusters;
}

/**
 * Pick the next best keyword cluster to target.
 * Returns the cluster with the highest combined priority score
 * that hasn't been published yet.
 */
export function pickNextCluster(keywords) {
  const untargeted = keywords.filter((k) => k.status === 'untargeted' || !k.status);
  if (untargeted.length === 0) return null;

  const clusters = clusterKeywords(untargeted);
  let bestCluster = null;
  let bestScore = -1;

  for (const [name, kws] of Object.entries(clusters)) {
    // Cluster score = sum of member priorities, weighted by cluster size
    const totalScore = kws.reduce((sum, k) => sum + scorePriority(k), 0);
    const avgScore = totalScore / kws.length;
    const clusterScore = avgScore + Math.log2(kws.length + 1) * 10; // bonus for larger clusters

    if (clusterScore > bestScore) {
      bestScore = clusterScore;
      bestCluster = { name, keywords: kws, score: Math.round(clusterScore), primaryKeyword: kws[0] };
    }
  }

  return bestCluster;
}

/**
 * Enrich keywords with priority scores and cluster assignments.
 */
export function enrichKeywords(keywords) {
  // Score all keywords
  const scored = keywords.map((kw) => ({
    ...kw,
    priority: scorePriority(kw),
    status: kw.status || 'untargeted',
    addedDate: kw.addedDate || new Date().toISOString().split('T')[0],
  }));

  // Cluster and assign cluster names
  const clusters = clusterKeywords(scored);
  for (const [clusterName, kws] of Object.entries(clusters)) {
    const shortName = clusterName.split(' ').slice(0, 3).join('-').toLowerCase();
    for (const kw of kws) {
      const match = scored.find((s) => s.keyword === kw.keyword);
      if (match) match.cluster = shortName;
    }
  }

  return scored.sort((a, b) => b.priority - a.priority);
}

/**
 * Get keyword coverage stats for a site.
 */
export function getStats(keywords) {
  const total = keywords.length;
  const published = keywords.filter((k) => k.status === 'published').length;
  const planned = keywords.filter((k) => k.status === 'planned').length;
  const untargeted = keywords.filter((k) => k.status === 'untargeted' || !k.status).length;
  const totalVolume = keywords.reduce((sum, k) => sum + (k.volume || 0), 0);
  const capturedVolume = keywords.filter((k) => k.status === 'published').reduce((sum, k) => sum + (k.volume || 0), 0);

  return {
    total,
    published,
    planned,
    untargeted,
    coverage: total > 0 ? Math.round((published / total) * 100) : 0,
    totalVolume,
    capturedVolume,
    volumeCoverage: totalVolume > 0 ? Math.round((capturedVolume / totalVolume) * 100) : 0,
  };
}

// Helpers
function getWords(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function wordOverlap(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const smaller = Math.min(setA.size, setB.size);
  return smaller > 0 ? intersection / smaller : 0;
}
