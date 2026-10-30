import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Shield, Lock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
          Verified Identity
        </span>
        <h1 className="text-2xl font-bold text-[#233B53] mt-0.5">Citizen Profile</h1>
        <p className="text-xs text-[#697786] mt-1">
          Your personal information is securely managed under municipal privacy regulations.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-[#DCE2E8]">
          <div className="w-16 h-16 rounded-full bg-[#233B53] text-white flex items-center justify-center font-bold text-xl shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#233B53]">{user?.name}</h2>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#315F80]/10 text-[#315F80] border border-[#315F80]/20 mt-1">
              Registered Citizen
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <div className="flex items-center text-[#697786] mb-1">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-[#315F80]" />
              <span className="font-semibold">Registered Email</span>
            </div>
            <p className="font-bold text-[#233B53]">{user?.email}</p>
          </div>

          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <div className="flex items-center text-[#697786] mb-1">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-[#315F80]" />
              <span className="font-semibold">Contact Phone</span>
            </div>
            <p className="font-bold text-[#233B53]">{user?.phone || 'Not provided'}</p>
          </div>

          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <div className="flex items-center text-[#697786] mb-1">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#315F80]" />
              <span className="font-semibold">Account Registration</span>
            </div>
            <p className="font-bold text-[#233B53]">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString([], {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Current Hackathon Cycle'}
            </p>
          </div>

          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <div className="flex items-center text-[#697786] mb-1">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-[#39734D]" />
              <span className="font-semibold">Verification Level</span>
            </div>
            <p className="font-bold text-[#39734D]">Tier 1 - Standard Municipal Citizen</p>
          </div>
        </div>

        {/* Privacy Box */}
        <div className="bg-[#315F80]/5 p-4 rounded border border-[#315F80]/20 flex items-start space-x-3 text-xs text-[#263442]">
          <Lock className="w-4 h-4 text-[#315F80] mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-bold text-[#233B53]">Responsible AI & Privacy Protection</span>
            <p className="text-[#697786] leading-relaxed text-[11px]">
              CivicPulse AI adheres to responsible civic computing guidelines. Your telephone and email are protected and only accessible to assigned officers resolving your grievance.
            </p>
          </div>
        </div>

        <div className="pt-2 flex space-x-3">
          <Link
            to="/citizen/my-complaints"
            className="inline-flex items-center px-4 py-2 rounded text-xs font-semibold text-white bg-[#233B53] hover:bg-[#315F80] transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            <span>View My Complaints</span>
          </Link>
          <Link
            to="/citizen/report"
            className="inline-flex items-center px-4 py-2 rounded text-xs font-semibold text-[#233B53] bg-white border border-[#DCE2E8] hover:bg-[#F4F6F8] transition"
          >
            <span>Report An Issue</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
