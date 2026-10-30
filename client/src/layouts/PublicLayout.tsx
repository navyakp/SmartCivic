import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Shield, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#233B53] text-[#DCE2E8] border-t border-[#315F80]/40 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Identity */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-[#315F80] flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-base">SmartCivic</span>
              </div>
              <p className="text-xs text-[#DCE2E8]/80 leading-relaxed">
                Transforming scattered citizen complaints into prioritized, explainable, geographically intelligent and trackable civic action.
              </p>
              <div className="pt-2 text-[11px] text-[#547D99]">
                AI-Powered Municipal Civic Intelligence Platform
              </div>
            </div>

            {/* Col 2: Citizen Services */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Citizen Services
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/citizen/report" className="hover:text-white transition">
                    Report a Civic Issue
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-white transition">
                    Track Complaint Status
                  </Link>
                </li>
                <li>
                  <Link to="/citizen/my-complaints" className="hover:text-white transition">
                    My Complaints History
                  </Link>
                </li>
                <li>
                  <Link to="/#how-it-works" className="hover:text-white transition">
                    How AI Prioritization Works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Authorities & Transparency */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Municipal Governance
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/admin" className="hover:text-white transition">
                    Authority Command Center
                  </Link>
                </li>
                <li>
                  <Link to="/admin/map" className="hover:text-white transition">
                    Live Civic Issue Map
                  </Link>
                </li>
                <li>
                  <Link to="/admin/analytics" className="hover:text-white transition">
                    Civic Trends & Resolution KPI
                  </Link>
                </li>
                <li>
                  <Link to="/admin/departments" className="hover:text-white transition">
                    Department Service Charters
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Help & Contact */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Civic Helpline
              </h4>
              <ul className="space-y-2 text-xs text-[#DCE2E8]/80">
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#547D99]" />
                  <span>24x7 Control Room: 1800-CIVIC-PULSE</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#547D99]" />
                  <span>grievances@SmartCivic.gov</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#547D99] mt-0.5" />
                  <span>Municipal Corporation Central Headquarters</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#315F80]/30 flex flex-col md:flex-row items-center justify-between text-xs text-[#DCE2E8]/60">
            <p>&copy; {new Date().getFullYear()} SmartCivic Platform. Built for Civic Technology Hackathon.</p>
            <p className="mt-2 md:mt-0">
              Demonstration Environment &bull; Transparent, Explainable & Responsible AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

