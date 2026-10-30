import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Building2, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { ActionBrief } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Link } from 'react-router-dom';

export const AIInsightsPage: React.FC = () => {
  const [briefs, setBriefs] = useState<ActionBrief[]>([]);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const [briefRes, statusRes] = await Promise.all([
          api.getAIInsights(),
          api.getAIStatus(),
        ]);
        setBriefs(briefRes.briefs || []);
        setAiStatus(statusRes);
      } catch (err) {
        console.error('Failed to load AI insights:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Civic Intelligence Engine
          </span>
          <h1 className="text-2xl font-bold text-[#233B53]">AI Action Briefs & Synthesized Insights</h1>
          <p className="text-xs text-[#697786] mt-0.5">
            Automated operational briefings generated from clustered municipal complaints.
          </p>
        </div>

        {/* Engine status indicator */}
        {aiStatus && (
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-[#DCE2E8] shadow-sm text-xs">
            <div className={`w-2 h-2 rounded-full ${aiStatus.geminiConfigured ? 'bg-[#39734D]' : 'bg-[#C76B19]'}`} />
            <span className="font-semibold text-[#233B53]">
              {aiStatus.geminiConfigured ? 'Gemini 1.5 Flash (Live)' : 'NLP Heuristic Engine (Local)'}
            </span>
          </div>
        )}
      </div>

      {/* Responsible AI Disclaimer Banner */}
      <div className="bg-[#315F80]/10 border border-[#315F80]/30 rounded-lg p-4 flex items-start space-x-3 text-xs text-[#263442]">
        <ShieldCheck className="w-5 h-5 text-[#315F80] mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold text-[#233B53]">Responsible AI Governance Protocol</h4>
          <p className="text-[#697786] leading-relaxed text-[11px]">
            AI action briefs synthesize patterns across citizen submissions to assist municipal officers.
            Recommendations are operational suggestions and do not replace physical site verification by licensed municipal engineers.
          </p>
        </div>
      </div>

      {/* Action Briefs Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#697786]">
          Synthesizing complaint patterns into action briefs...
        </div>
      ) : briefs.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-[#DCE2E8] text-center space-y-2">
          <Brain className="w-10 h-10 text-[#697786]/40 mx-auto" />
          <h3 className="font-bold text-sm text-[#233B53]">No Clustered Action Briefs at this Time</h3>
          <p className="text-xs text-[#697786]">
            Action briefs automatically generate when 2 or more related complaints converge in an operational sector.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {briefs.map((brief) => (
            <div
              key={brief.briefId}
              className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm p-6 space-y-4 hover:border-[#315F80] transition"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DCE2E8]">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#233B53] bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#DCE2E8]">
                      {brief.briefId}
                    </span>
                    <span className="text-xs text-[#697786]">&bull;</span>
                    <span className="text-xs font-semibold text-[#233B53]">{brief.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#263442]">{brief.headline}</h3>
                </div>
                <PriorityBadge priority={brief.priorityLevel} score={brief.averageScore} showScore />
              </div>

              {/* Potential Impact & Suggested Dept */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#F4F6F8] p-3 rounded border border-[#DCE2E8]">
                  <span className="text-[#697786] font-semibold">Suggested Department:</span>
                  <p className="font-bold text-[#233B53] mt-0.5">{brief.suggestedDepartment}</p>
                </div>
                <div className="bg-[#F4F6F8] p-3 rounded border border-[#DCE2E8]">
                  <span className="text-[#697786] font-semibold">Involved Reports:</span>
                  <p className="font-bold text-[#233B53] mt-0.5">{brief.complaintCount} Citizen Grievances</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#697786]">Synthesized Impact:</span>
                <p className="text-xs text-[#263442] mt-0.5 leading-relaxed">{brief.potentialImpact}</p>
              </div>

              {/* Recommended Next Steps */}
              <div className="space-y-2 pt-2 border-t border-[#DCE2E8]">
                <span className="text-xs font-bold text-[#233B53]">Recommended Operational Steps:</span>
                <ul className="space-y-1.5 text-xs text-[#263442]">
                  {brief.recommendedNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#39734D] mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Correlated Complaint IDs */}
              <div className="pt-3 border-t border-[#DCE2E8] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#697786] text-[11px]">Correlated IDs:</span>
                  {brief.complaintIds.slice(0, 3).map((cId) => (
                    <Link
                      key={cId}
                      to={`/admin/complaints/${cId}`}
                      className="font-mono text-[10px] text-[#315F80] hover:underline bg-[#F4F6F8] px-1.5 py-0.5 rounded border border-[#DCE2E8]"
                    >
                      {cId}
                    </Link>
                  ))}
                  {brief.complaintIds.length > 3 && (
                    <span className="text-[10px] text-[#697786]">+{brief.complaintIds.length - 3} more</span>
                  )}
                </div>

                <Link
                  to="/admin/map"
                  className="text-xs font-semibold text-[#315F80] hover:underline flex items-center"
                >
                  <span>View Cluster on Map</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
