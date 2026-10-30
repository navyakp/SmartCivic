export interface ActionBrief {
  briefId: string;
  headline: string;
  locationArea: string;
  category: string;
  complaintCount: number;
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  averageScore: number;
  potentialImpact: string;
  suggestedDepartment: string;
  recommendedNextSteps: string[];
  complaintIds: string[];
  generatedAt: Date;
  disclaimer: string;
}

export function generateActionBriefs(complaints: Array<any>): ActionBrief[] {
  if (!complaints || complaints.length === 0) return [];

  // Group open complaints by category and general location proximity
  const clusters: { [key: string]: any[] } = {};

  for (const c of complaints) {
    if (c.status === 'RESOLVED' || c.status === 'REJECTED') continue;
    // rough location grouping based on rounded coordinates (~300m cells)
    const latKey = c.latitude ? c.latitude.toFixed(2) : '0';
    const lonKey = c.longitude ? c.longitude.toFixed(2) : '0';
    const groupKey = `${c.category || 'General'}@${latKey},${lonKey}`;

    if (!clusters[groupKey]) {
      clusters[groupKey] = [];
    }
    clusters[groupKey].push(c);
  }

  const briefs: ActionBrief[] = [];

  for (const [key, group] of Object.entries(clusters)) {
    if (group.length < 2) continue; // Focus on patterns with 2+ reports

    const [category] = key.split('@');
    const avgScore = Math.round(
      group.reduce((acc, curr) => acc + (curr.priorityScore || 50), 0) / group.length
    );

    let priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    if (avgScore >= 75) priorityLevel = 'CRITICAL';
    else if (avgScore >= 50) priorityLevel = 'HIGH';
    else if (avgScore >= 25) priorityLevel = 'MEDIUM';
    else priorityLevel = 'LOW';

    const locationName = group[0].address || 'Identified Civic Sector';
    const complaintIds = group.map((c) => c.complaintId);

    let suggestedDept = 'Public Infrastructure';
    let impact = 'Commuter disruption and resident inconvenience.';
    let steps = [
      'Dispatch field engineering officer for site inspection.',
      'Correlate with municipal maintenance scheduled logs.',
    ];

    if (category.includes('Road')) {
      suggestedDept = 'Road Maintenance Department';
      impact = 'Risk of tire damage, vehicular breakdown, and pedestrian trip hazard.';
      steps = [
        'Deploy asphalt repair team to assess crater diameter and depth.',
        'Install reflective hazard cones around severe road breaches.',
        'Issue work order to municipal road resurfacing contractor.',
      ];
    } else if (category.includes('Waterlogging') || category.includes('Drain')) {
      suggestedDept = 'Drainage and Sanitation Department';
      impact = 'Road inundation, wastewater contamination, and vehicular hydroplaning risk.';
      steps = [
        'Dispatch suction tanker crew to clear stormwater drain choke points.',
        'Inspect culverts and catch-basins for plastic and silt obstructions.',
        'Verify runoff gradient to prevent backflow into adjacent residences.',
      ];
    } else if (category.includes('Waste')) {
      suggestedDept = 'Waste Management Department';
      impact = 'Sanitation hazard, odor nuisance, and stray animal scavenging.';
      steps = [
        'Route mechanized collection tipper truck for immediate clearance.',
        'Sanitize collection point with lime powder disinfectant.',
        'Evaluate if additional community dumpster capacity is needed.',
      ];
    } else if (category.includes('Streetlight')) {
      suggestedDept = 'Electrical Maintenance Department';
      impact = 'Dark corridor vulnerability, reduced traffic visibility, and security concern.';
      steps = [
        'Check phase supply feeder pillar and timer switches.',
        'Replace burned LED fixtures or faulty line cables.',
        'Perform nighttime illumination check across the junction.',
      ];
    }

    briefs.push({
      briefId: `AB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      headline: `${group.length} Active ${category} Reports Concentrated Near ${locationName.split(',')[0]}`,
      locationArea: locationName,
      category,
      complaintCount: group.length,
      priorityLevel,
      averageScore: avgScore,
      potentialImpact: impact,
      suggestedDepartment: suggestedDept,
      recommendedNextSteps: steps,
      complaintIds,
      generatedAt: new Date(),
      disclaimer: 'AI-generated operational brief. Recommended steps must be verified by the supervising department officer before civil work execution.',
    });
  }

  return briefs;
}

