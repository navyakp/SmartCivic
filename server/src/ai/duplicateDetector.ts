import { IComplaint } from '../models/Complaint.js';

/**
 * Calculates geographic distance between two coordinates in meters using the Haversine formula.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates token-level Jaccard text similarity (0 to 100).
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokenize = (s: string): Set<string> => {
    const words = s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    return new Set(words);
  };

  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) intersection++;
  });

  const union = tokens1.size + tokens2.size - intersection;
  return Math.round((intersection / union) * 100);
}

export interface DuplicateDetectionResult {
  complaintId: string;
  similarity: number; // 0 - 100%
  distanceMeters: number;
  reason: string;
}

export function detectDuplicates(
  target: {
    complaintId: string;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
  },
  existingComplaints: Array<{
    complaintId: string;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    status: string;
  }>
): DuplicateDetectionResult[] {
  const candidates: DuplicateDetectionResult[] = [];

  for (const existing of existingComplaints) {
    if (existing.complaintId === target.complaintId) continue;
    // Exclude already resolved or rejected complaints from active duplicate flagging
    if (existing.status === 'RESOLVED' || existing.status === 'REJECTED') continue;

    const distanceMeters = calculateHaversineDistanceMeters(
      target.latitude,
      target.longitude,
      existing.latitude,
      existing.longitude
    );

    const isSameCategory =
      target.category.toLowerCase().trim() === existing.category.toLowerCase().trim();

    const textSim = calculateTextSimilarity(
      `${target.title} ${target.description}`,
      `${existing.title} ${existing.description}`
    );

    // Geographic weight: If < 50m: 45 pts, < 150m: 35 pts, < 300m: 20 pts, < 600m: 10 pts, else 0 pts
    let geoScore = 0;
    if (distanceMeters <= 50) geoScore = 45;
    else if (distanceMeters <= 150) geoScore = 35;
    else if (distanceMeters <= 300) geoScore = 25;
    else if (distanceMeters <= 600) geoScore = 15;

    // Category weight: 25 pts if matching
    const catScore = isSameCategory ? 25 : 5;

    // Text similarity contributes up to 30 pts
    const textScore = (textSim / 100) * 30;

    const totalSimilarity = Math.min(100, Math.round(geoScore + catScore + textScore));

    // Threshold of 60% combined similarity or (within 100m + same category)
    if (totalSimilarity >= 60 || (distanceMeters <= 100 && isSameCategory)) {
      let reason = `Possible duplicate of ${existing.complaintId}. Located ${distanceMeters}m away in '${target.category}'.`;
      if (textSim >= 40) {
        reason += ` Substantial textual overlap (${textSim}% match).`;
      } else {
        reason += ` Close geographic proximity for identical civic category.`;
      }

      candidates.push({
        complaintId: existing.complaintId,
        similarity: Math.max(totalSimilarity, 65),
        distanceMeters,
        reason,
      });
    }
  }

  // Sort candidates by similarity descending
  return candidates.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

