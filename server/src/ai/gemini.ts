import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export const AIAnalysisOutputSchema = z.object({
  category: z.enum([
    'Roads and potholes',
    'Waterlogging',
    'Drainage and sewage',
    'Waste management',
    'Streetlights',
    'Public infrastructure',
    'Public safety',
    'Other',
  ]),
  summary: z.string().min(5),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']),
  impact: z.string().min(3),
  safety_risk: z.boolean(),
  reasoning: z.string().min(5),
});

export type AIAnalysisOutput = z.infer<typeof AIAnalysisOutputSchema>;

interface GeminiAnalysisResult {
  data: AIAnalysisOutput;
  model: string;
  source: 'GEMINI' | 'HEURISTIC';
}

/**
 * Intelligent deterministic heuristic NLP fallback when Gemini API key is not configured or offline.
 */
export function analyzeWithLocalHeuristics(title: string, description: string): AIAnalysisOutput {
  const text = `${title} ${description}`.toLowerCase();

  let category: AIAnalysisOutput['category'] = 'Other';
  let urgency: AIAnalysisOutput['urgency'] = 'Medium';
  let safety_risk = false;
  let impact = 'General public inconvenience';
  let reasoning = 'Categorized based on municipal civic keywords analysis.';

  // High danger keywords
  const isCritical =
    text.includes('accident') ||
    text.includes('electrocution') ||
    text.includes('live wire') ||
    text.includes('collapsed') ||
    text.includes('sinkhole') ||
    text.includes('gas leak') ||
    text.includes('danger to life');

  if (text.includes('waterlog') || text.includes('water logging') || text.includes('submerged') || text.includes('standing water') || text.includes('flood')) {
    category = 'Waterlogging';
    urgency = text.includes('main road') || text.includes('traffic') || text.includes('school') ? 'High' : 'Medium';
    impact = 'Traffic disruption and pedestrian access restriction';
    safety_risk = text.includes('deep') || text.includes('manhole') || text.includes('accident');
    reasoning = 'Water accumulation detected in pedestrian/vehicular thoroughfare.';
  } else if (text.includes('pothole') || text.includes('crater') || text.includes('damaged road') || text.includes('asphalt') || text.includes('tar road') || text.includes('cracked road')) {
    category = 'Roads and potholes';
    urgency = text.includes('accident') || text.includes('deep') || text.includes('highway') || text.includes('main road') ? 'High' : 'Medium';
    impact = 'Risk of vehicular damage and commuter accidents';
    safety_risk = true;
    reasoning = 'Pothole or road surface degradation poses direct vehicular safety hazards.';
  } else if (text.includes('drain') || text.includes('sewage') || text.includes('gutter') || text.includes('overflowing drain') || text.includes('foul smell') || text.includes('manhole')) {
    category = 'Drainage and sewage';
    urgency = text.includes('overflow') || text.includes('contamination') || text.includes('hospital') ? 'High' : 'Medium';
    impact = 'Public health risk, foul odor, and sanitary hazard';
    safety_risk = text.includes('open manhole') || text.includes('disease');
    reasoning = 'Blockage or breach in municipal drainage and sewage network.';
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('litter') || text.includes('overflowing bin')) {
    category = 'Waste management';
    urgency = text.includes('dead animal') || text.includes('burning') || text.includes('days') ? 'High' : 'Low';
    impact = 'Environmental pollution, vector-borne disease vector, and aesthetic degradation';
    safety_risk = false;
    reasoning = 'Waste accumulation requiring sanitation collection and disposal.';
  } else if (text.includes('light') || text.includes('dark') || text.includes('lamp post') || text.includes('broken bulb') || text.includes('no light') || text.includes('streetlight')) {
    category = 'Streetlights';
    urgency = text.includes('junction') || text.includes('isolated') || text.includes('crime') ? 'High' : 'Medium';
    impact = 'Poor night visibility and heightened safety vulnerability';
    safety_risk = text.includes('sparking') || text.includes('open wire') || text.includes('isolated');
    reasoning = 'Streetlight outage impacting public security and nighttime road visibility.';
  } else if (text.includes('bridge') || text.includes('footpath') || text.includes('pavement') || text.includes('railing') || text.includes('bus stop') || text.includes('park') || text.includes('bench')) {
    category = 'Public infrastructure';
    urgency = text.includes('broken') || text.includes('dangerous') ? 'Medium' : 'Low';
    impact = 'Reduced civic utility and accessibility for citizens';
    safety_risk = text.includes('falling') || text.includes('railing');
    reasoning = 'Public infrastructure element in need of structural repair.';
  } else if (text.includes('stray') || text.includes('encroachment') || text.includes('hazard') || text.includes('fire') || text.includes('theft')) {
    category = 'Public safety';
    urgency = 'High';
    impact = 'Immediate threat to community physical safety';
    safety_risk = true;
    reasoning = 'Potential or acute community safety hazard.';
  }

  if (isCritical) {
    urgency = 'Critical';
    safety_risk = true;
    impact = 'Severe hazard to human life and critical transit corridor';
    reasoning = 'Presence of acute danger indicators requiring emergency municipal dispatch.';
  }

  // Summary generation
  const summary = description.length > 120 
    ? `${description.slice(0, 115).trim()}...` 
    : (description || title);

  return {
    category,
    summary,
    urgency,
    impact,
    safety_risk,
    reasoning,
  };
}

/**
 * Analyzes a civic complaint using Google Gemini API if key is present,
 * otherwise safely uses local heuristic engine.
 */
export async function analyzeComplaintWithGemini(
  title: string,
  description: string
): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      data: analyzeWithLocalHeuristics(title, description),
      model: 'local-heuristic-nlp-v1',
      source: 'HEURISTIC',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `You are the SmartCivic Complaint Understanding Engine for municipal governance.
Analyze the following citizen report and return ONLY a valid JSON object matching this schema:
{
  "category": "Roads and potholes" | "Waterlogging" | "Drainage and sewage" | "Waste management" | "Streetlights" | "Public infrastructure" | "Public safety" | "Other",
  "summary": "Concise 1-2 sentence executive summary of the core issue",
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "impact": "Specific public/traffic/health impact",
  "safety_risk": boolean,
  "reasoning": "Clear factual explanation for the urgency and impact"
}

Citizen Complaint Title: "${title}"
Citizen Complaint Description: "${description}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    const validated = AIAnalysisOutputSchema.parse(parsed);

    return {
      data: validated,
      model: modelName,
      source: 'GEMINI',
    };
  } catch (error: any) {
    console.warn('[Gemini AI] Gemini API call failed, falling back to local heuristic analysis:', error.message);
    return {
      data: analyzeWithLocalHeuristics(title, description),
      model: 'fallback-heuristic-nlp',
      source: 'HEURISTIC',
    };
  }
}

