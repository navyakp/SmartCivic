import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Complaint, IComplaint, ComplaintStatus, ComplaintPriority } from '../models/Complaint.js';
import { ComplaintHistory } from '../models/ComplaintHistory.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { User } from '../models/User.js';
import { analyzeComplaintWithGemini } from '../ai/gemini.js';
import { calculatePriorityScore } from '../ai/priorityEngine.js';
import { detectDuplicates, calculateHaversineDistanceMeters } from '../ai/duplicateDetector.js';

/**
 * Generates collision-safe complaint ID: e.g. CP-2026-00102
 */
async function generateUniqueComplaintId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const sequence = String(count + 1).padStart(5, '0');
  const candidate = `CP-${currentYear}-${sequence}`;

  // Double check uniqueness
  const exists = await Complaint.findOne({ complaintId: candidate });
  if (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `CP-${currentYear}-${randomSuffix}`;
  }
  return candidate;
}

export async function submitComplaint(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, category, address, latitude, longitude } = req.body;

    if (!title || !description || !category || !address || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: 'Title, description, category, address, latitude, and longitude are required.',
      });
      return;
    }

    const citizen = req.user;
    if (!citizen) {
      res.status(401).json({ success: false, message: 'Authentication required to submit complaint.' });
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ success: false, message: 'Invalid latitude or longitude coordinates.' });
      return;
    }

    // Process image uploads
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        imageUrls.push(`/uploads/${file.filename}`);
      });
    } else if (req.file) {
      imageUrls.push(`/uploads/${req.file.filename}`);
    }

    const complaintId = await generateUniqueComplaintId();

    // 1. Run AI Analysis
    const aiResult = await analyzeComplaintWithGemini(title, description);

    // 2. Compute nearby unresolved complaints for clustering factor
    const existingOpen = await Complaint.find({
      status: { $nin: ['RESOLVED', 'REJECTED'] },
    }).lean();

    let nearbyCount = 0;
    for (const other of existingOpen) {
      if (calculateHaversineDistanceMeters(lat, lon, other.latitude, other.longitude) <= 500) {
        nearbyCount++;
      }
    }

    // Past complaints count in same category
    const categoryCount = await Complaint.countDocuments({ category });

    // 3. Deterministic Priority Calculation
    const priorityResult = calculatePriorityScore({
      urgencyLevel: aiResult.data.urgency,
      safetyRisk: aiResult.data.safety_risk,
      category,
      description,
      nearbyOpenCount: nearbyCount,
      categoryHistoryCount: categoryCount,
    });

    // 4. Duplicate Detection
    const duplicateCandidates = detectDuplicates(
      {
        complaintId,
        title,
        description,
        category,
        latitude: lat,
        longitude: lon,
      },
      existingOpen
    );

    // 5. Save Complaint
    const complaint = new Complaint({
      complaintId,
      citizenId: citizen._id,
      citizenName: citizen.name,
      citizenEmail: citizen.email,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      imageUrls,
      address: address.trim(),
      latitude: lat,
      longitude: lon,
      status: 'SUBMITTED',
      priority: priorityResult.priority,
      priorityScore: priorityResult.score,
      priorityBreakdown: priorityResult.breakdown,
      priorityReasoning: priorityResult.reasoning,
      aiSummary: aiResult.data.summary,
      aiCategory: aiResult.data.category,
      aiUrgency: aiResult.data.urgency,
      aiImpact: aiResult.data.impact,
      aiSafetyRisk: aiResult.data.safety_risk,
      aiStatus: aiResult.source === 'GEMINI' ? 'SUCCESS' : 'HEURISTIC',
      aiModel: aiResult.model,
      duplicateCandidates,
    });

    await complaint.save();

    // 6. Record AI Analysis record
    await AIAnalysis.create({
      complaintId,
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
    });

    // 7. Initial History record
    await ComplaintHistory.create({
      complaintId,
      changedBy: citizen._id,
      changedByName: citizen.name,
      previousStatus: 'NEW',
      newStatus: 'SUBMITTED',
      remarks: 'Complaint submitted by citizen via SmartCivic portal.',
      timestamp: new Date(),
    });

    // 8. Citizen Notification
    await Notification.create({
      recipientId: citizen._id,
      complaintId,
      title: 'Complaint Lodged Successfully',
      message: `Your report #${complaintId} has been registered and analyzed by SmartCivic. Initial priority: ${priorityResult.priority}.`,
      type: 'STATUS_UPDATE',
    });

    // 9. Admin Alert if Critical or Cluster detected
    if (priorityResult.priority === 'CRITICAL' || duplicateCandidates.length > 0) {
      const admins = await User.find({ role: 'admin' });
      for (const adm of admins) {
        await Notification.create({
          recipientId: adm._id,
          complaintId,
          title: priorityResult.priority === 'CRITICAL' ? 'Critical Hazard Alert' : 'Duplicate Cluster Detected',
          message: priorityResult.priority === 'CRITICAL'
            ? `New CRITICAL issue #${complaintId} in '${category}' requires prompt review.`
            : `Issue #${complaintId} matches ${duplicateCandidates.length} existing open report(s).`,
          type: priorityResult.priority === 'CRITICAL' ? 'CRITICAL_ALERT' : 'DUPLICATE_ALERT',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted and analyzed successfully.',
      complaint,
    });
  } catch (error: any) {
    console.error('[Complaint Submission Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Error submitting complaint.' });
  }
}

export async function getMyComplaints(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const complaints = await Complaint.find({ citizenId: req.user._id })
      .populate('assignedDepartmentId', 'name code')
      .populate('assignedOfficerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getComplaintDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const query = id.startsWith('CP-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query)
      .populate('assignedDepartmentId', 'name code description')
      .populate('assignedOfficerId', 'name email phone role')
      .populate('priorityOverride.overriddenBy', 'name role');

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Role-based visibility check: citizens can only view their own
    if (req.user?.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden. You can only view your own complaints.' });
      return;
    }

    const history = await ComplaintHistory.find({ complaintId: complaint.complaintId }).sort({ timestamp: 1 });
    const aiAnalysis = await AIAnalysis.findOne({ complaintId: complaint.complaintId });

    // Retrieve full details of duplicate candidates if any
    let duplicateDetails: any[] = [];
    if (complaint.duplicateCandidates && complaint.duplicateCandidates.length > 0) {
      const dupIds = complaint.duplicateCandidates.map((d) => d.complaintId);
      duplicateDetails = await Complaint.find({ complaintId: { $in: dupIds } })
        .select('complaintId title category status priority createdAt address latitude longitude')
        .lean();
    }

    res.json({
      success: true,
      complaint,
      history,
      aiAnalysis,
      duplicateDetails,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function trackComplaintPublic(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({ complaintId: complaintId.toUpperCase().trim() })
      .populate('assignedDepartmentId', 'name code')
      .select('-citizenEmail -citizenPhone'); // Privacy preservation

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint ID not found in municipal registry.' });
      return;
    }

    const history = await ComplaintHistory.find({ complaintId: complaint.complaintId })
      .select('previousStatus newStatus remarks timestamp changedByName')
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      complaint,
      history,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, remarks, evidenceUrl } = req.body;

    const validStatuses: ComplaintStatus[] = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
      'REOPENED',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    if (['REJECTED', 'REOPENED'].includes(status) && (!remarks || !remarks.trim())) {
      res.status(400).json({ success: false, message: `A mandatory reason is required when marking as ${status}.` });
      return;
    }

    const query = id.startsWith('CP-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const previousStatus = complaint.status;
    complaint.status = status;

    if (status === 'RESOLVED') {
      complaint.resolvedAt = new Date();
      if (remarks) complaint.resolutionRemarks = remarks.trim();
      if (evidenceUrl) complaint.resolutionImageUrl = evidenceUrl;
    } else if (status === 'REJECTED') {
      complaint.rejectionReason = remarks?.trim();
    } else if (status === 'REOPENED') {
      complaint.reopenReason = remarks?.trim();
    }

    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint.complaintId,
      changedBy: req.user!._id,
      changedByName: req.user!.name,
      previousStatus,
      newStatus: status,
      remarks: remarks || `Status transitioned to ${status}`,
      evidenceUrl,
      timestamp: new Date(),
    });

    await ActivityLog.create({
      userId: req.user!._id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'STATUS_UPDATED',
      entityType: 'COMPLAINT',
      entityId: complaint.complaintId,
      details: { previousStatus, newStatus: status, remarks },
    });

    // Notify Citizen
    await Notification.create({
      recipientId: complaint.citizenId,
      complaintId: complaint.complaintId,
      title: `Status Update: ${status}`,
      message: `Your complaint #${complaint.complaintId} has been updated to ${status}. ${remarks ? `Remarks: "${remarks}"` : ''}`,
      type: 'STATUS_UPDATE',
    });

    res.json({
      success: true,
      message: `Status updated to ${status}.`,
      complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function overridePriority(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { priority, reason } = req.body;

    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      res.status(400).json({ success: false, message: 'Invalid priority level.' });
      return;
    }

    if (!reason || reason.trim().length < 5) {
      res.status(400).json({ success: false, message: 'A clear mandatory justification is required for priority overrides.' });
      return;
    }

    const query = id.startsWith('CP-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const previousPriority = complaint.priority;
    complaint.priority = priority as ComplaintPriority;
    complaint.priorityOverride = {
      overriddenBy: req.user!._id,
      previousPriority,
      newPriority: priority as ComplaintPriority,
      reason: reason.trim(),
      overriddenAt: new Date(),
    };

    await complaint.save();

    await ActivityLog.create({
      userId: req.user!._id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'PRIORITY_OVERRIDDEN',
      entityType: 'COMPLAINT',
      entityId: complaint.complaintId,
      details: { previousPriority, newPriority: priority, reason },
    });

    res.json({
      success: true,
      message: 'Priority override recorded in official audit ledger.',
      complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function assignComplaint(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { departmentId, officerId, remarks } = req.body;

    if (!departmentId) {
      res.status(400).json({ success: false, message: 'departmentId is required.' });
      return;
    }

    const query = id.startsWith('CP-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const previousStatus = complaint.status;
    complaint.assignedDepartmentId = departmentId;
    if (officerId) complaint.assignedOfficerId = officerId;
    complaint.assignedAt = new Date();
    complaint.assignmentRemarks = remarks;
    complaint.status = 'ASSIGNED';

    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint.complaintId,
      changedBy: req.user!._id,
      changedByName: req.user!.name,
      previousStatus,
      newStatus: 'ASSIGNED',
      remarks: remarks || 'Assigned to municipal department.',
      timestamp: new Date(),
    });

    // Notify Officer if assigned
    if (officerId) {
      await Notification.create({
        recipientId: officerId,
        complaintId: complaint.complaintId,
        title: 'New Complaint Assignment',
        message: `Complaint #${complaint.complaintId} has been assigned to you for inspection and action.`,
        type: 'NEW_ASSIGNMENT',
      });
    }

    // Notify Citizen
    await Notification.create({
      recipientId: complaint.citizenId,
      complaintId: complaint.complaintId,
      title: 'Complaint Assigned to Department',
      message: `Your complaint #${complaint.complaintId} has been assigned for municipal action.`,
      type: 'STATUS_UPDATE',
    });

    res.json({
      success: true,
      message: 'Complaint assigned successfully.',
      complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function resolveComplaint(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { remarks, resolutionImageUrl } = req.body;

    if (!remarks || remarks.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Detailed resolution remarks are required.' });
      return;
    }

    const query = id.startsWith('CP-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const previousStatus = complaint.status;
    complaint.status = 'RESOLVED';
    complaint.resolutionRemarks = remarks.trim();
    if (resolutionImageUrl) complaint.resolutionImageUrl = resolutionImageUrl;
    complaint.resolvedAt = new Date();

    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint.complaintId,
      changedBy: req.user!._id,
      changedByName: req.user!.name,
      previousStatus,
      newStatus: 'RESOLVED',
      remarks: `Resolved: ${remarks}`,
      evidenceUrl: resolutionImageUrl,
      timestamp: new Date(),
    });

    await ActivityLog.create({
      userId: req.user!._id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'COMPLAINT_RESOLVED',
      entityType: 'COMPLAINT',
      entityId: complaint.complaintId,
      details: { remarks, resolutionImageUrl },
    });

    await Notification.create({
      recipientId: complaint.citizenId,
      complaintId: complaint.complaintId,
      title: 'Complaint Resolved',
      message: `Your complaint #${complaint.complaintId} has been marked as RESOLVED. Resolution notes: "${remarks}"`,
      type: 'STATUS_UPDATE',
    });

    res.json({
      success: true,
      message: 'Complaint resolved and citizen notified.',
      complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

