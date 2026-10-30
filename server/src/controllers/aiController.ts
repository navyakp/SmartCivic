import { Request, Response } from 'express';
import { Complaint } from '../models/Complaint.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { analyzeComplaintWithGemini } from '../ai/gemini.js';
import { calculatePriorityScore } from '../ai/priorityEngine.js';
import { detectDuplicates, calculateHaversineDistanceMeters } from '../ai/duplicateDetector.js';

export async function reanalyzeComplaint(req: Request, res: Response): Promise<void> {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // 1. Run AI Analysis
    const aiResult = await analyzeComplaintWithGemini(complaint.title, complaint.description);

    // 2. Count nearby unresolved
    const existingOpen = await Complaint.find({
      complaintId: { $ne: complaintId },
      status: { $nin: ['RESOLVED', 'REJECTED'] },
    }).lean();

    let nearbyCount = 0;
    for (const other of existingOpen) {
      if (
        calculateHaversineDistanceMeters(
          complaint.latitude,
          complaint.longitude,
          other.latitude,
          other.longitude
        ) <= 500
      ) {
        nearbyCount++;
      }
    }

    const categoryCount = await Complaint.countDocuments({ category: complaint.category });

    // 3. Priority
    const priorityResult = calculatePriorityScore({
      urgencyLevel: aiResult.data.urgency,
      safetyRisk: aiResult.data.safety_risk,
      category: complaint.category,
      description: complaint.description,
      nearbyOpenCount: nearbyCount,
      categoryHistoryCount: categoryCount,
    });

    // 4. Duplicate Detection
    const duplicateCandidates = detectDuplicates(
      {
        complaintId: complaint.complaintId,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
      },
      existingOpen
    );

    // Update Complaint
    complaint.aiSummary = aiResult.data.summary;
    complaint.aiCategory = aiResult.data.category;
    complaint.aiUrgency = aiResult.data.urgency;
    complaint.aiImpact = aiResult.data.impact;
    complaint.aiSafetyRisk = aiResult.data.safety_risk;
    complaint.aiStatus = aiResult.source === 'GEMINI' ? 'SUCCESS' : 'HEURISTIC';
    complaint.aiModel = aiResult.model;
    complaint.priority = priorityResult.priority;
    complaint.priorityScore = priorityResult.score;
    complaint.priorityBreakdown = priorityResult.breakdown;
    complaint.priorityReasoning = priorityResult.reasoning;
    complaint.duplicateCandidates = duplicateCandidates;

    await complaint.save();

    // Upsert AIAnalysis record
    const analysisRecord = await AIAnalysis.findOneAndUpdate(
      { complaintId },
      {
        modelName: aiResult.model,
        processingStatus: aiResult.source === 'GEMINI' ? 'SUCCESS' : 'HEURISTIC',
        category: aiResult.data.category,
        summary: aiResult.data.summary,
        urgency: aiResult.data.urgency,
        impact: aiResult.data.impact,
        safetyRisk: aiResult.data.safety_risk,
        reasoning: aiResult.data.reasoning,
        duplicateResults: duplicateCandidates,
        priorityBreakdown: {
          ...priorityResult.breakdown,
          total: priorityResult.score,
        },
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Analysis completed using ${aiResult.source} engine (${aiResult.model}).`,
      complaint,
      analysis: analysisRecord,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const { complaintId } = req.params;
    const analysis = await AIAnalysis.findOne({ complaintId });

    if (!analysis) {
      res.status(404).json({ success: false, message: 'No AI analysis record found.' });
      return;
    }

    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAIStatus(_req: Request, res: Response): Promise<void> {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  res.json({
    success: true,
    geminiConfigured: hasKey,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    mode: hasKey ? 'LIVE_GEMINI_API' : 'LOCAL_HEURISTIC_NLP',
    statusMessage: hasKey
      ? 'Google Gemini Generative AI active and ready.'
      : 'Local Rule-Based Heuristic NLP active (set GEMINI_API_KEY in .env to enable Google Gemini Live API).',
  });
}

