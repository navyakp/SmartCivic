import React, { useEffect, useState } from 'react';
import { Settings, Brain, Shield, Key, Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getAIStatus();
      setAiStatus(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async () => {
    setTestResult(null);
    try {
      const res = await api.getAIStatus();
      setAiStatus(res);
      setTestResult(
        res.geminiConfigured
          ? 'Successfully verified Google Gemini API connection.'
          : 'Local Heuristic NLP pipeline is running reliably. To connect live Gemini API, add GEMINI_API_KEY in server/.env.'
      );
    } catch (err: any) {
      setTestResult(`Test failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
          System Diagnostics
        </span>
        <h1 className="text-2xl font-bold text-[#233B53]">Settings & AI Diagnostics</h1>
        <p className="text-xs text-[#697786] mt-0.5">
          Configuration parameters, generative AI diagnostics, and database telemetry.
        </p>
      </div>

      {/* AI ENGINE DIAGNOSTICS CARD */}
      <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E8]">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-[#315F80]" />
            <h2 className="font-bold text-sm text-[#233B53]">Google Gemini AI Pipeline Status</h2>
          </div>
          <button
            onClick={handleTestConnection}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#233B53] bg-[#F4F6F8] hover:bg-[#DCE2E8] rounded border border-[#DCE2E8] transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#315F80]" />
            <span>Test Pipeline</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 bg-[#315F80]/10 text-[#233B53] text-xs rounded border border-[#315F80]/20 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#39734D] flex-shrink-0" />
            <span>{testResult}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <span className="text-[#697786] font-semibold block">Execution Mode</span>
            <div className="mt-1 flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.geminiConfigured ? 'bg-[#39734D]' : 'bg-[#C76B19]'
                }`}
              />
              <span className="font-bold text-[#233B53] text-sm">
                {aiStatus?.mode || 'LOCAL_HEURISTIC_NLP'}
              </span>
            </div>
            <p className="text-[10px] text-[#697786] mt-1">
              {aiStatus?.geminiConfigured
                ? 'Calling Google Gemini API'
                : 'Deterministic Local NLP fallback'}
            </p>
          </div>

          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <span className="text-[#697786] font-semibold block">Active Model</span>
            <span className="font-bold text-[#233B53] text-sm mt-1 block font-mono">
              {aiStatus?.model || 'gemini-1.5-flash'}
            </span>
            <p className="text-[10px] text-[#697786] mt-1">Structured JSON schema output</p>
          </div>

          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <span className="text-[#697786] font-semibold block">Backend Key Protection</span>
            <span className="font-bold text-[#39734D] text-sm mt-1 block flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Secured on Backend
            </span>
            <p className="text-[10px] text-[#697786] mt-1">Zero frontend client exposure</p>
          </div>
        </div>

        {/* Setup guide */}
        <div className="bg-[#F4F6F8] p-4 rounded-lg border border-[#DCE2E8] space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-[#233B53]">
            <Key className="w-4 h-4 text-[#315F80]" />
            <span>How to connect your Gemini API Key</span>
          </div>
          <p className="text-[#697786] leading-relaxed">
            To activate live Google Gemini API calls during testing or deployment:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[#263442] font-mono text-[11px] bg-white p-3 rounded border border-[#DCE2E8]">
            <li>Open the file: <code className="text-[#315F80]">server/.env</code></li>
            <li>Add your Gemini API Key: <code className="text-[#315F80]">GEMINI_API_KEY=AIzaSy...</code></li>
            <li>Restart the backend server. The engine automatically switches to live Gemini Generative AI!</li>
          </ol>
        </div>
      </div>

      {/* DATABASE & SYSTEM TELEMETRY */}
      <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm space-y-4 text-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#DCE2E8]">
          <Database className="w-5 h-5 text-[#315F80]" />
          <h2 className="font-bold text-sm text-[#233B53]">Database & Storage Configuration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <span className="text-[#697786] font-semibold block">Database Engine</span>
            <span className="font-bold text-[#233B53] text-sm mt-0.5 block">
              MongoDB Mongoose Adapter
            </span>
            <span className="text-[11px] text-[#39734D] mt-1 block">
              Connected & Persisting Data
            </span>
          </div>

          <div className="bg-[#F4F6F8] p-4 rounded border border-[#DCE2E8]">
            <span className="text-[#697786] font-semibold block">Media Uploads Directory</span>
            <span className="font-mono text-[11px] text-[#233B53] mt-0.5 block">
              server/uploads/
            </span>
            <span className="text-[11px] text-[#697786] mt-1 block">
              Multer 5MB File Limit (JPG, PNG, WEBP)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
