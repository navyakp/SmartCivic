import { Request, Response } from 'express';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';

export async function getDepartments(_req: Request, res: Response): Promise<void> {
  try {
    const departments = await Department.find().populate('officerIds', 'name email phone role');

    // Attach active and resolved complaint counts
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const activeCount = await Complaint.countDocuments({
          assignedDepartmentId: dept._id,
          status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
        });
        const resolvedCount = await Complaint.countDocuments({
          assignedDepartmentId: dept._id,
          status: 'RESOLVED',
        });
        return {
          ...dept.toObject(),
          activeCount,
          resolvedCount,
        };
      })
    );

    res.json({ success: true, count: enriched.length, departments: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createDepartment(req: Request, res: Response): Promise<void> {
  try {
    const { name, code, description, officerIds } = req.body;

    if (!name || !code) {
      res.status(400).json({ success: false, message: 'Name and Code are required.' });
      return;
    }

    const dept = new Department({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || '',
      officerIds: officerIds || [],
    });

    await dept.save();
    res.status(201).json({ success: true, department: dept });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateDepartment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, officerIds } = req.body;

    const dept = await Department.findById(id);
    if (!dept) {
      res.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }

    if (name) dept.name = name.trim();
    if (description !== undefined) dept.description = description.trim();
    if (officerIds) dept.officerIds = officerIds;

    await dept.save();
    res.json({ success: true, department: dept });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteDepartment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndDelete(id);
    if (!dept) {
      res.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getOfficers(_req: Request, res: Response): Promise<void> {
  try {
    const officers = await User.find({ role: { $in: ['officer', 'admin'] } })
      .select('name email phone role departmentId')
      .populate('departmentId', 'name code');

    res.json({ success: true, officers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

