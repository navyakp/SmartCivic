import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Complaint, Hotspot } from '../../types';
import { CivicMap } from '../../components/CivicMap';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { Map, Filter, Search, RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveMapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [searchLocation, setSearchLocation] = useState('');
  const [showHotspotCircles, setShowHotspotCircles] = useState(true);

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    async function loadMapData() {
      setLoading(true);
      try {
        const [compRes, hotRes] = await Promise.all([
          api.getAdminComplaints({ limit: '100' }),
          api.getHotspots(),
        ]);
        setComplaints(compRes.complaints);
        setHotspots(hotRes.hotspots);
        if (hotRes.hotspots.length > 0) {
          setSelectedHotspot(hotRes.hotspots[0]);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (category !== 'ALL' && c.category !== category) return false;
    if (priority !== 'ALL' && c.priority !== priority) return false;
    if (status !== 'ALL' && c.status !== status) return false;
    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase();
      if (!c.address.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const categories = [
    'ALL',
    'Roads and potholes',
    'Waterlogging',
    'Drainage and sewage',
    'Waste management',
    'Streetlights',
    'Public infrastructure',
    'Public safety',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#315F80]">
            Geographic Information System
          </span>
          <h1 className="text-2xl font-bold text-[#233B53]">Live Civic Issue Map & Hotspots</h1>
          <p className="text-xs text-[#697786] mt-0.5">
            Real-time geospatial visualization of citizen complaints and algorithmic clustering hotspots.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <label className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded border border-[#DCE2E8] shadow-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showHotspotCircles}
              onChange={(e) => setShowHotspotCircles(e.target.checked)}
              className="rounded text-[#315F80] focus:ring-0"
            />
            <span className="font-semibold text-[#233B53]">Show Hotspot Radii (600m)</span>
          </label>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#DCE2E8] shadow-sm flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#697786]" />
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search location or title on map..."
            className="w-full pl-8 pr-2.5 py-1.5 border border-[#DCE2E8] rounded text-xs focus:ring-1 focus:ring-[#315F80]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2.5 py-1.5 border border-[#DCE2E8] rounded bg-white text-[#263442]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-2.5 py-1.5 border border-[#DCE2E8] rounded bg-white text-[#263442]"
        >
          <option value="ALL">Priority: ALL</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-2.5 py-1.5 border border-[#DCE2E8] rounded bg-white text-[#263442]"
        >
          <option value="ALL">Status: ALL</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <button
          onClick={() => {
            setCategory('ALL');
            setPriority('ALL');
            setStatus('ALL');
            setSearchLocation('');
          }}
          className="px-2.5 py-1.5 text-[#697786] hover:text-[#233B53] flex items-center ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Map & Hotspot Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MAP CONTAINER (3 SPANS) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white p-2 rounded-lg border border-[#DCE2E8] shadow-sm">
            <CivicMap
              complaints={filteredComplaints}
              hotspots={hotspots}
              height="600px"
              showHotspots={showHotspotCircles}
            />
          </div>

          {/* Map Legend */}
          <div className="bg-white px-4 py-2.5 rounded-lg border border-[#DCE2E8] shadow-sm flex flex-wrap items-center justify-between text-xs text-[#697786]">
            <span className="font-semibold text-[#233B53]">Map Marker Legend:</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#B42318] inline-block border border-white shadow-sm"></span>
                <span className="text-[#B42318] font-bold">Critical Hazard</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#C76B19] inline-block border border-white shadow-sm"></span>
                <span className="text-[#C76B19] font-bold">High Priority</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#B58A26] inline-block border border-white shadow-sm"></span>
                <span className="text-[#B58A26] font-bold">Medium Priority</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#39734D] inline-block border border-white shadow-sm"></span>
                <span className="text-[#39734D] font-bold">Low / Resolved</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full border border-dashed border-[#B42318] bg-[#B42318]/20 inline-block"></span>
                <span>600m Cluster Hotspot</span>
              </span>
            </div>
          </div>
        </div>

        {/* HOTSPOT SUMMARY PANEL (1 SPAN) */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-[#DCE2E8] shadow-sm">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#DCE2E8]">
              <AlertTriangle className="w-4 h-4 text-[#B42318]" />
              <h3 className="font-bold text-sm text-[#233B53]">Detected Hotspots</h3>
            </div>
            <p className="text-[11px] text-[#697786] mb-3">
              Geographic clustering flags areas where multiple unresolved reports occur within a 600m perimeter.
            </p>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {hotspots.map((hs) => (
                <div
                  key={hs.id}
                  onClick={() => setSelectedHotspot(hs)}
                  className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                    selectedHotspot?.id === hs.id
                      ? 'border-[#315F80] bg-[#315F80]/5 shadow-sm'
                      : 'border-[#DCE2E8] bg-[#F4F6F8] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[#233B53]">{hs.id}</span>
                    <PriorityBadge priority={hs.priorityLevel} score={hs.averagePriorityScore} showScore />
                  </div>
                  <h4 className="font-bold text-[#263442] truncate">{hs.primaryAddress}</h4>
                  <div className="text-[11px] text-[#697786] mt-1">
                    <span className="font-semibold text-[#233B53]">{hs.complaintCount} Reports</span> concentrated in '{hs.topCategory}'.
                  </div>
                  <p className="text-[10px] text-[#315F80] font-medium mt-1 bg-white p-1.5 rounded border border-[#DCE2E8]">
                    {hs.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
