import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  MapPin,
  Brain,
  Copy,
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { LocationPicker } from '../../components/LocationPicker';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';

export const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Waterlogging');
  const [address, setAddress] = useState('Near Metro Station, MG Road, Central Ward');
  const [latitude, setLatitude] = useState(12.9742);
  const [longitude, setLongitude] = useState(77.6082);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state after successful AI analysis & submission
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const categories = [
    'Roads and potholes',
    'Waterlogging',
    'Drainage and sewage',
    'Waste management',
    'Streetlights',
    'Public infrastructure',
    'Public safety',
    'Other',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setError(`File "${file.name}" is not a supported image (JPG, PNG, WEBP).`);
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setImageFiles((prev) => [...prev, ...validFiles].slice(0, 3));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 3));
    setError(null);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Demonstration shortcut button matching Section 24 Step 1
  const fillHackathonDemo = () => {
    setTitle('Water accumulating near main road due to blocked drainage');
    setDescription(
      'There is water accumulating near the main road because the drainage appears to be blocked. Vehicles are having difficulty passing and pedestrians are forced onto the fast lane.'
    );
    setCategory('Waterlogging');
    setAddress('MG Road Metro Junction, Central Ward');
    setLatitude(12.9742);
    setLongitude(77.6082);
    setError(null);
  };

  const fillPotholeDemo = () => {
    setTitle('Deep crater pothole on Tech Park Boulevard');
    setDescription(
      'A deep 10-inch pothole has formed on the outer lane near Gate 3. Two motorcycles have already suffered rim damage this morning. Poses immediate risk of severe vehicular accident.'
    );
    setCategory('Roads and potholes');
    setAddress('Tech Park Boulevard near Gate 3, Sector 4');
    setLatitude(12.9862);
    setLongitude(77.6152);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !address.trim()) {
      setError('Please fill in all required complaint fields.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('address', address.trim());
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.submitComplaint(formData);
      setSubmittedComplaint(res.complaint);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#DCE2E8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Civic Report Submission
          </span>
          <h1 className="text-2xl font-bold text-[#233B53] mt-0.5">Report a Civic Problem</h1>
          <p className="text-xs text-[#697786] mt-1">
            Submissions are analyzed by AI for category verification, priority calculation, and duplicate detection.
          </p>
        </div>

        {/* Demo Scenario Shortcuts */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={fillHackathonDemo}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#233B53] bg-[#315F80]/10 hover:bg-[#315F80]/20 rounded border border-[#315F80]/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#315F80]" />
            <span>Fill Demo 1 (Waterlogging)</span>
          </button>
          <button
            type="button"
            onClick={fillPotholeDemo}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#233B53] bg-[#F4F6F8] hover:bg-[#DCE2E8] rounded border border-[#DCE2E8] transition"
          >
            <span>Fill Demo 2 (Pothole)</span>
          </button>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL / PANEL */}
      {submittedComplaint ? (
        <div className="bg-white rounded-lg border-2 border-[#39734D]/30 p-6 md:p-8 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-3 text-[#39734D]">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-[#233B53]">
                Complaint Successfully Lodged & Processed
              </h2>
              <p className="text-xs text-[#697786]">
                Municipal Reference: <strong className="font-mono text-[#233B53]">{submittedComplaint.complaintId}</strong>
              </p>
            </div>
          </div>

          {/* AI Understanding Breakdown */}
          <div className="bg-[#F4F6F8] rounded-lg p-5 border border-[#DCE2E8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E8]">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#315F80]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#233B53]">
                  AI Processing Result ({submittedComplaint.aiModel})
                </span>
              </div>
              <span className="bg-[#39734D]/15 text-[#39734D] text-[11px] px-2.5 py-0.5 rounded font-bold">
                {submittedComplaint.aiStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#697786] font-semibold">Predicted Category:</span>
                <p className="font-bold text-[#233B53] mt-0.5">{submittedComplaint.aiCategory || submittedComplaint.category}</p>
              </div>
              <div>
                <span className="text-[#697786] font-semibold">Computed Priority:</span>
                <div className="mt-0.5 flex items-center space-x-2">
                  <PriorityBadge priority={submittedComplaint.priority} score={submittedComplaint.priorityScore} showScore />
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs text-[#697786] font-semibold">Executive AI Summary:</span>
              <p className="text-xs text-[#263442] mt-0.5 italic bg-white p-3 rounded border border-[#DCE2E8]">
                "{submittedComplaint.aiSummary}"
              </p>
            </div>

            {/* Explainable Factor Breakdown */}
            <div>
              <span className="text-xs text-[#697786] font-semibold">Explainable Priority Factor Scoring:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1.5 text-center font-mono text-xs">
                <div className="bg-white p-2 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase">Urgency</div>
                  <div className="font-bold text-[#233B53] mt-0.5">{submittedComplaint.priorityBreakdown?.urgency ?? 0}/30</div>
                </div>
                <div className="bg-white p-2 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase">Public Safety</div>
                  <div className="font-bold text-[#233B53] mt-0.5">{submittedComplaint.priorityBreakdown?.safetyImpact ?? 0}/25</div>
                </div>
                <div className="bg-white p-2 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase">Community</div>
                  <div className="font-bold text-[#233B53] mt-0.5">{submittedComplaint.priorityBreakdown?.communityImpact ?? 0}/20</div>
                </div>
                <div className="bg-white p-2 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase">Cluster</div>
                  <div className="font-bold text-[#233B53] mt-0.5">{submittedComplaint.priorityBreakdown?.geographicCluster ?? 0}/15</div>
                </div>
                <div className="bg-white p-2 rounded border border-[#DCE2E8]">
                  <div className="text-[10px] text-[#697786] uppercase">Recurrence</div>
                  <div className="font-bold text-[#233B53] mt-0.5">{submittedComplaint.priorityBreakdown?.recurrence ?? 0}/10</div>
                </div>
              </div>
            </div>

            {/* Duplicate Notice */}
            {submittedComplaint.duplicateCandidates && submittedComplaint.duplicateCandidates.length > 0 && (
              <div className="bg-[#B58A26]/10 p-3 rounded border border-[#B58A26]/30 text-xs text-[#263442]">
                <div className="flex items-center space-x-1 font-bold text-[#B58A26] mb-1">
                  <Copy className="w-3.5 h-3.5" />
                  <span>Possible Duplicate Report Flagged for Administrative Correlation</span>
                </div>
                <p className="text-[11px] text-[#697786]">
                  Matches #{submittedComplaint.duplicateCandidates[0].complaintId} ({submittedComplaint.duplicateCandidates[0].similarity}% match, {submittedComplaint.duplicateCandidates[0].distanceMeters}m away). Your original complaint reference is preserved.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/citizen/track/${submittedComplaint.complaintId}`}
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-[#233B53] hover:bg-[#315F80] transition shadow-sm"
            >
              <span>Track Resolution Progress</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setTitle('');
                setDescription('');
                setImageFiles([]);
                setImagePreviews([]);
              }}
              className="px-4 py-2.5 rounded-md text-sm font-semibold text-[#233B53] bg-white border border-[#DCE2E8] hover:bg-[#F4F6F8] transition"
            >
              Submit Another Report
            </button>
            <Link
              to="/citizen/my-complaints"
              className="px-4 py-2.5 rounded-md text-sm font-medium text-[#697786] hover:text-[#233B53] transition"
            >
              Go to My Complaints
            </Link>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#DCE2E8] p-6 md:p-8 shadow-sm space-y-6">
          {error && (
            <div className="bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] p-3 rounded text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#263442]">
              Complaint Title <span className="text-[#B42318]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water accumulating near main road due to blocked drainage"
              className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#263442]">
              Primary Domain Category <span className="text-[#B42318]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80] bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#263442]">
              Detailed Description <span className="text-[#B42318]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed, affected commuters or residents, and whether there is immediate hazard to life or transit..."
              className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
            />
            <span className="text-[11px] text-[#697786]">
              AI will extract urgency keywords, evaluate safety hazards, and generate executive briefs for municipal officers.
            </span>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#263442]">
              Photographic Evidence (Optional, max 3 photos, up to 5MB each)
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded border border-[#DCE2E8] overflow-hidden group">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 3 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#DCE2E8] hover:border-[#315F80] rounded cursor-pointer transition text-[#697786] hover:text-[#315F80] bg-[#F4F6F8]">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Add Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Map Location Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#263442] mb-1">
              Geographic Location & Map Pin <span className="text-[#B42318]">*</span>
            </label>
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng, suggestion) => {
                setLatitude(lat);
                setLongitude(lng);
                if (suggestion) setAddress(suggestion);
              }}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-[#263442]">
              Street Address / Landmark <span className="text-[#B42318]">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. MG Road Metro Junction, Near Gate 2"
              className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#233B53] hover:bg-[#315F80] focus:outline-none transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing AI Pipeline & Logging Grievance...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Submit Grievance to Municipal Authority</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

