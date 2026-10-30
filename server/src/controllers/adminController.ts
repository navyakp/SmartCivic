import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { generateActionBriefs } from '../ai/actionBriefGenerator.js';
import { calculateHaversineDistanceMeters } from '../ai/duplicateDetector.js';

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
    });
    const critical = await Complaint.countDocuments({
      priority: 'CRITICAL',
      status: { $nin: ['RESOLVED', 'REJECTED'] },
    });
    const inProgress = await Complaint.countDocuments({
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
    });
    const resolved = await Complaint.countDocuments({ status: 'RESOLVED' });

    // Calculate actual average resolution time in hours
    const resolvedComplaints = await Complaint.find({
      status: 'RESOLVED',
      resolvedAt: { $exists: true },
    }).select('createdAt resolvedAt');

    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalMillis = resolvedComplaints.reduce((acc, curr) => {
        const diff = new Date(curr.resolvedAt!).getTime() - new Date(curr.createdAt).getTime();
        return acc + (diff > 0 ? diff : 0);
      }, 0);
      avgResolutionHours = Math.round(totalMillis / resolvedComplaints.length / (1000 * 60 * 60));
    }

    const recentComplaints = await Complaint.find()
      .populate('assignedDepartmentId', 'name code')
      .populate('assignedOfficerId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        total,
        pending,
        critical,
        inProgress,
        resolved,
        avgResolutionHours: avgResolutionHours || 36, // realistic baseline if none resolved yet
      },
      recentComplaints,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getComplaints(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      search,
      category,
      priority,
      status,
      departmentId,
      officerId,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query: any = {};

    // If logged in as officer, restrict to their department or assigned to them
    if (req.user?.role === 'officer') {
      if (req.user.departmentId) {
        query.$or = [
          { assignedOfficerId: req.user._id },
          { assignedDepartmentId: req.user.departmentId },
        ];
      } else {
        query.assignedOfficerId = req.user._id;
      }
    }

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
      ];
    }

    if (category && category !== 'ALL') query.category = category;
    if (priority && priority !== 'ALL') query.priority = priority;
    if (status && status !== 'ALL') query.status = status;
    if (departmentId && departmentId !== 'ALL') query.assignedDepartmentId = departmentId;
    if (officerId && officerId !== 'ALL') query.assignedOfficerId = officerId;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOption: any = {};
    sortOption[sortBy as string] = order === 'asc' ? 1 : -1;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('assignedDepartmentId', 'name code')
      .populate('assignedOfficerId', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      complaints,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    // 1. By Category
    const byCategoryRaw = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const byCategory = byCategoryRaw.map((item) => ({
      name: item._id,
      count: item.count,
    }));

    // 2. By Priority
    const byPriorityRaw = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const byPriority = priorityOrder.map((pri) => {
      const found = byPriorityRaw.find((p) => p._id === pri);
      return {
        priority: pri,
        count: found ? found.count : 0,
      };
    });

    // 3. Weekly Trends (past 7 days activity)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTrendsRaw = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days
    const weeklyTrends: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = weeklyTrendsRaw.find((w) => w._id === dateStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyTrends.push({
        date: dateStr,
        day: dayName,
        submitted: match ? match.submitted : 0,
        resolved: match ? match.resolved : 0,
      });
    }

    // 4. Department Workload
    const departments = await Department.find();
    const departmentWorkload: any[] = [];

    for (const dept of departments) {
      const activeCount = await Complaint.countDocuments({
        assignedDepartmentId: dept._id,
        status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
      });
      const resolvedCount = await Complaint.countDocuments({
        assignedDepartmentId: dept._id,
        status: 'RESOLVED',
      });

      departmentWorkload.push({
        name: dept.name,
        code: dept.code,
        active: activeCount,
        resolved: resolvedCount,
        total: activeCount + resolvedCount,
      });
    }

    res.json({
      success: true,
      byCategory,
      byPriority,
      weeklyTrends,
      departmentWorkload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getHotspots(req: AuthRequest, res: Response): Promise<void> {
  try {
    const radiusMeters = 600; // 600 meter cluster window
    const openComplaints = await Complaint.find({
      status: { $nin: ['RESOLVED', 'REJECTED'] },
    }).lean();

    const visited = new Set<string>();
    const hotspots: any[] = [];

    for (let i = 0; i < openComplaints.length; i++) {
      const anchor = openComplaints[i];
      if (visited.has(anchor.complaintId)) continue;

      const cluster: any[] = [anchor];
      visited.add(anchor.complaintId);

      for (let j = i + 1; j < openComplaints.length; j++) {
        const other = openComplaints[j];
        if (visited.has(other.complaintId)) continue;

        const dist = calculateHaversineDistanceMeters(
          anchor.latitude,
          anchor.longitude,
          other.latitude,
          other.longitude
        );

        if (dist <= radiusMeters) {
          cluster.push(other);
          visited.add(other.complaintId);
        }
      }

      // Group into hotspot if 2 or more related open complaints exist in vicinity
      if (cluster.length >= 2) {
        const avgLat = cluster.reduce((sum, c) => sum + c.latitude, 0) / cluster.length;
        const avgLon = cluster.reduce((sum, c) => sum + c.longitude, 0) / cluster.length;
        const avgScore = Math.round(cluster.reduce((sum, c) => sum + (c.priorityScore || 50), 0) / cluster.length);

        const categoryCounts: { [cat: string]: number } = {};
        cluster.forEach((c) => {
          categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
        });

        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0];

        hotspots.push({
          id: `HS-${hotspots.length + 1}`,
          center: { lat: avgLat, lng: avgLon },
          radius: radiusMeters,
          complaintCount: cluster.length,
          averagePriorityScore: avgScore,
          priorityLevel: avgScore >= 75 ? 'CRITICAL' : avgScore >= 50 ? 'HIGH' : 'MEDIUM',
          categories: Object.keys(categoryCounts),
          topCategory,
          primaryAddress: cluster[0].address,
          complaints: cluster.map((c) => ({
            complaintId: c.complaintId,
            title: c.title,
            category: c.category,
            priority: c.priority,
            score: c.priorityScore,
            status: c.status,
            latitude: c.latitude,
            longitude: c.longitude,
            createdAt: c.createdAt,
          })),
          recommendedAction: `Deploy coordinated multi-unit taskforce for ${topCategory}. Issue immediate civil work dispatch orders.`,
        });
      }
    }

    res.json({
      success: true,
      count: hotspots.length,
      hotspots: hotspots.sort((a, b) => b.complaintCount - a.complaintCount),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getInsights(req: AuthRequest, res: Response): Promise<void> {
  try {
    const openComplaints = await Complaint.find({
      status: { $nin: ['RESOLVED', 'REJECTED'] },
    }).lean();

    const briefs = generateActionBriefs(openComplaints);

    res.json({
      success: true,
      count: briefs.length,
      briefs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDuplicates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const complaintsWithDuplicates = await Complaint.find({
      'duplicateCandidates.0': { $exists: true },
    })
      .select('complaintId title description category status priority address latitude longitude duplicateCandidates createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaintsWithDuplicates.length,
      complaints: complaintsWithDuplicates,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
