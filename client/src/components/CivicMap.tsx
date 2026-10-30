import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Complaint, Hotspot, ComplaintPriority } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored pin creator
function createCustomPin(priority: ComplaintPriority, isResolved: boolean): L.DivIcon {
  let color = '#315F80';
  if (isResolved) color = '#39734D';
  else if (priority === 'CRITICAL') color = '#B42318';
  else if (priority === 'HIGH') color = '#C76B19';
  else if (priority === 'MEDIUM') color = '#B58A26';
  else color = '#39734D';

  const html = `
    <div style="
      background-color: ${color};
      width: 26px;
      height: 26px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-civic-pin',
    html,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

function MapCenterSetter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface CivicMapProps {
  complaints: Complaint[];
  hotspots?: Hotspot[];
  selectedCategory?: string;
  selectedPriority?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showHotspots?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints,
  hotspots = [],
  center = [12.9740, 77.6080],
  zoom = 13,
  height = '500px',
  showHotspots = true,
}) => {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#DCE2E8] shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapCenterSetter center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotspot Circles */}
        {showHotspots &&
          hotspots.map((hs) => (
            <Circle
              key={hs.id}
              center={[hs.center.lat, hs.center.lng]}
              radius={hs.radius}
              pathOptions={{
                color: hs.priorityLevel === 'CRITICAL' ? '#B42318' : '#C76B19',
                fillColor: hs.priorityLevel === 'CRITICAL' ? '#B42318' : '#C76B19',
                fillOpacity: 0.18,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs font-sans">
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#DCE2E8]">
                    <span className="font-bold text-xs text-[#233B53]">Cluster: {hs.id}</span>
                    <PriorityBadge priority={hs.priorityLevel} score={hs.averagePriorityScore} showScore />
                  </div>
                  <p className="text-xs text-[#263442] font-semibold">{hs.primaryAddress}</p>
                  <p className="text-xs text-[#697786] mt-1">
                    <strong>{hs.complaintCount} open reports</strong> concentrated within 600m perimeter.
                  </p>
                  <p className="text-[11px] text-[#233B53] font-medium mt-1 bg-[#F4F6F8] p-1.5 rounded">
                    Action: {hs.recommendedAction}
                  </p>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Complaint Markers */}
        {complaints.map((c) => {
          if (!c.latitude || !c.longitude) return null;
          const isResolved = c.status === 'RESOLVED';
          const pin = createCustomPin(c.priority, isResolved);

          return (
            <Marker key={c._id || c.complaintId} position={[c.latitude, c.longitude]} icon={pin}>
              <Popup>
                <div className="p-1.5 max-w-xs font-sans">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#233B53]">
                      {c.complaintId}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h4 className="font-semibold text-xs text-[#263442] leading-snug mb-1">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-[#697786] mb-2 line-clamp-2">
                    {c.address}
                  </p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#DCE2E8]">
                    <PriorityBadge priority={c.priority} score={c.priorityScore} showScore />
                    <Link
                      to={`/admin/complaints/${c.complaintId}`}
                      className="text-xs font-medium text-[#315F80] hover:underline"
                    >
                      Inspect &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

