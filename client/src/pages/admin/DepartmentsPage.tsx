import React, { useEffect, useState } from 'react';
import { Building2, Plus, Users, CheckCircle, Wrench, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Department } from '../../types';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [deptRes, offRes] = await Promise.all([api.getDepartments(), api.getOfficers()]);
      setDepartments(deptRes.departments);
      setOfficers(offRes.officers || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      await api.createDepartment({
        name: newName.trim(),
        code: newCode.trim().toUpperCase(),
        description: newDesc.trim(),
      });
      setShowAddModal(false);
      setNewName('');
      setNewCode('');
      setNewDesc('');
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create department.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Municipal Structure
          </span>
          <h1 className="text-2xl font-bold text-[#233B53]">Departments & Service Teams</h1>
          <p className="text-xs text-[#697786] mt-0.5">
            Manage operational divisions, supervisory rosters, and maintenance capacities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] rounded shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm p-5 space-y-4 hover:border-[#315F80] transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#315F80] bg-[#315F80]/10 px-2 py-0.5 rounded">
                  {dept.code}
                </span>
                <span className="text-[11px] text-[#697786]">
                  {dept.officerIds?.length || 0} Officers Assigned
                </span>
              </div>
              <h3 className="font-bold text-base text-[#233B53]">{dept.name}</h3>
              <p className="text-xs text-[#697786] leading-relaxed">{dept.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#DCE2E8]">
              {/* Workload stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8]">
                  <span className="text-[#697786] text-[10px] uppercase font-bold block">
                    Active Cases
                  </span>
                  <span className="font-bold text-sm text-[#C76B19] mt-0.5 block">
                    {dept.activeCount ?? 0}
                  </span>
                </div>
                <div className="bg-[#F4F6F8] p-2.5 rounded border border-[#DCE2E8]">
                  <span className="text-[#697786] text-[10px] uppercase font-bold block">
                    Resolved
                  </span>
                  <span className="font-bold text-sm text-[#39734D] mt-0.5 block">
                    {dept.resolvedCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Roster preview */}
              {dept.officerIds && dept.officerIds.length > 0 && (
                <div className="text-[11px] text-[#697786]">
                  <span className="font-semibold text-[#233B53]">Officers: </span>
                  {dept.officerIds.map((o: any) => o.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Supervisory Officers Roster */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 border-b border-[#DCE2E8] bg-[#F4F6F8] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#233B53]">Supervisory Officer Directory</h3>
            <p className="text-[11px] text-[#697786]">Authorized department field personnel</p>
          </div>
          <Users className="w-4 h-4 text-[#315F80]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F6F8] text-[#697786] uppercase text-[10px] font-semibold border-b border-[#DCE2E8]">
              <tr>
                <th className="px-4 py-3">Officer Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2E8]">
              {officers.map((off) => (
                <tr key={off._id} className="hover:bg-[#F4F6F8]/60 transition">
                  <td className="px-4 py-3 font-semibold text-[#233B53]">{off.name}</td>
                  <td className="px-4 py-3 text-[#697786]">{off.email}</td>
                  <td className="px-4 py-3 text-[#697786]">{off.phone || '+1-555-0142'}</td>
                  <td className="px-4 py-3 text-[#233B53] font-medium">
                    {off.departmentId?.name || 'Central Administration'}
                  </td>
                  <td className="px-4 py-3 uppercase text-[10px] font-bold text-[#315F80]">
                    {off.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-[#DCE2E8] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE2E8]">
              <h3 className="font-bold text-base text-[#233B53]">Create Municipal Department</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#697786] hover:text-[#233B53]"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-[#B42318]/10 text-[#B42318] text-xs rounded border border-[#B42318]/30">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263442] mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Traffic Management Bureau"
                  className="w-full p-2 border border-[#DCE2E8] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263442] mb-1">
                  Code / Abbreviation (3-4 Letters)
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. TMB"
                  className="w-full p-2 border border-[#DCE2E8] rounded uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263442] mb-1">Charter Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Scope of work and responsibilities..."
                  className="w-full p-2 border border-[#DCE2E8] rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-[#697786] hover:bg-[#F4F6F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] transition shadow-sm disabled:opacity-50"
                >
                  {modalLoading ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

