import { ComplaintPriority, IPriorityBreakdown } from '../models/Complaint.js';

export interface PriorityCalculationResult {
  score: number;
  priority: ComplaintPriority;
  breakdown: IPriorityBreakdown;
  reasoning: string;
  factorExplanations: {
    urgencyExplanation: string;
    safetyExplanation: string;
    communityExplanation: string;
    clusterExplanation: string;
    recurrenceExplanation: string;
  };
  scoringVersion: string;
  calculatedAt: Date;
}

export interface PriorityInput {
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  safetyRisk: boolean;
  category: string;
  description: string;
  nearbyOpenCount: number; // complaints within 500m
  categoryHistoryCount: number; // recurring reports in same area
}

export function calculatePriorityScore(input: PriorityInput): PriorityCalculationResult {
  // 1. Urgency: 0 - 30 points
  let urgencyScore = 10;
  let urgencyExplanation = 'Routine civic maintenance requirement.';
  if (input.urgencyLevel === 'Critical') {
    urgencyScore = 30;
    urgencyExplanation = 'Emergency urgency requiring immediate municipal intervention within 2-4 hours.';
  } else if (input.urgencyLevel === 'High') {
    urgencyScore = 24;
    urgencyExplanation = 'High urgency condition creating active disruption to daily commuter or utility functions.';
  } else if (input.urgencyLevel === 'Medium') {
    urgencyScore = 15;
    urgencyExplanation = 'Standard maintenance timeline; issue is causing moderate inconvenience.';
  } else {
    urgencyScore = 8;
    urgencyExplanation = 'Low urgency; scheduled maintenance window acceptable.';
  }

  // 2. Public safety impact: 0 - 25 points
  let safetyScore = 5;
  let safetyExplanation = 'No immediate structural or physical threat to public health identified.';
  if (input.safetyRisk) {
    safetyScore = 24;
    safetyExplanation = 'Elevated public safety risk (active hazard to pedestrians, commuters, or sanitation).';
  } else {
    const text = input.description.toLowerCase();
    if (text.includes('child') || text.includes('school') || text.includes('elderly') || text.includes('night') || text.includes('hospital')) {
      safetyScore = 18;
      safetyExplanation = 'Sensitive location context (near school/hospital/pedestrian corridor) increases risk exposure.';
    } else if (['Waterlogging', 'Roads and potholes', 'Drainage and sewage'].includes(input.category)) {
      safetyScore = 14;
      safetyExplanation = 'Infrastructure category has moderate latent safety implications if left unattended.';
    } else {
      safetyScore = 6;
      safetyExplanation = 'Minimal hazard to human safety; primarily aesthetic or minor inconvenience.';
    }
  }

  // 3. Community impact: 0 - 20 points
  let communityScore = 8;
  let communityExplanation = 'Localized disturbance affecting a single spot or small group of residents.';
  const text = input.description.toLowerCase();
  if (text.includes('main road') || text.includes('junction') || text.includes('bus stop') || text.includes('market') || text.includes('arterial')) {
    communityScore = 19;
    communityExplanation = 'Key arterial corridor or public transit hub affects thousands of daily commuters.';
  } else if (text.includes('neighborhood') || text.includes('lane') || text.includes('society') || text.includes('colony')) {
    communityScore = 14;
    communityExplanation = 'Impacts residential neighborhood access and local neighborhood mobility.';
  } else {
    communityScore = 10;
    communityExplanation = 'Moderate community utility impact.';
  }

  // 4. Geographic clustering: 0 - 15 points
  let clusterScore = 3;
  let clusterExplanation = 'Isolated report in this 500m vicinity.';
  if (input.nearbyOpenCount >= 5) {
    clusterScore = 15;
    clusterExplanation = `Critical geographic cluster detected (${input.nearbyOpenCount} active reports within 500m radius). High concentration of systemic failure.`;
  } else if (input.nearbyOpenCount >= 3) {
    clusterScore = 11;
    clusterExplanation = `Active localized cluster (${input.nearbyOpenCount} complaints within 500m radius).`;
  } else if (input.nearbyOpenCount >= 1) {
    clusterScore = 7;
    clusterExplanation = `Corroborated issue (${input.nearbyOpenCount} other open report nearby).`;
  } else {
    clusterScore = 3;
    clusterExplanation = 'No other open reports within 500m perimeter.';
  }

  // 5. Recurrence: 0 - 10 points
  let recurrenceScore = 2;
  let recurrenceExplanation = 'First documented issue of this type in this zone.';
  if (input.categoryHistoryCount >= 6) {
    recurrenceScore = 10;
    recurrenceExplanation = `Chronic recurring zone (${input.categoryHistoryCount} past incidents recorded). Indicates underlying infrastructure deficiency.`;
  } else if (input.categoryHistoryCount >= 3) {
    recurrenceScore = 7;
    recurrenceExplanation = `Frequent issue pattern (${input.categoryHistoryCount} previous occurrences in this sector).`;
  } else if (input.categoryHistoryCount >= 1) {
    recurrenceScore = 4;
    recurrenceExplanation = 'Occasional recurrence in this sector.';
  } else {
    recurrenceScore = 2;
    recurrenceExplanation = 'New or infrequent maintenance record.';
  }

  const totalScore = Math.min(100, Math.max(0, urgencyScore + safetyScore + communityScore + clusterScore + recurrenceScore));

  let priority: ComplaintPriority = 'LOW';
  if (totalScore >= 75) {
    priority = 'CRITICAL';
  } else if (totalScore >= 50) {
    priority = 'HIGH';
  } else if (totalScore >= 25) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  const breakdown: IPriorityBreakdown = {
    urgency: urgencyScore,
    safetyImpact: safetyScore,
    communityImpact: communityScore,
    geographicCluster: clusterScore,
    recurrence: recurrenceScore,
  };

  const reasoning = `Computed overall priority score of ${totalScore}/100 [Urgency: ${urgencyScore}/30, Safety: ${safetyScore}/25, Community Impact: ${communityScore}/20, Geographic Cluster: ${clusterScore}/15, Recurrence: ${recurrenceScore}/10]. ${urgencyExplanation} ${safetyExplanation}`;

  return {
    score: totalScore,
    priority,
    breakdown,
    reasoning,
    factorExplanations: {
      urgencyExplanation,
      safetyExplanation,
      communityExplanation,
      clusterExplanation,
      recurrenceExplanation,
    },
    scoringVersion: 'v1.2-SmartCivic-deterministic',
    calculatedAt: new Date(),
  };
}

