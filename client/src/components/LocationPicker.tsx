import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, addressSuggestion?: string) => void;
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const pinIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `
    <div style="
      background-color: #B42318;
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #FFFFFF;
      box-shadow: 0 3px 6px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
}) => {
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingGeo(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLoadingGeo(false);

        // Attempt reverse geocode via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          onChange(lat, lng, data.display_name);
        } catch {
          onChange(lat, lng);
        }
      },
      (err) => {
        setLoadingGeo(false);
        setGeoError(`Unable to retrieve location: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleMarkerDragEnd = (e: any) => {
    const marker = e.target;
    const position = marker.getLatLng();
    onChange(position.lat, position.lng);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center text-xs text-[#697786]">
          <MapPin className="w-3.5 h-3.5 mr-1 text-[#315F80]" />
          <span>Click anywhere on the map or drag the red pin to set the exact civic issue location</span>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={loadingGeo}
          className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#233B53] bg-white border border-[#DCE2E8] rounded shadow-sm hover:bg-[#F4F6F8] transition"
        >
          <Navigation className={`w-3.5 h-3.5 mr-1.5 text-[#315F80] ${loadingGeo ? 'animate-spin' : ''}`} />
          {loadingGeo ? 'Locating...' : 'Use My Current Location'}
        </button>
      </div>

      {geoError && (
        <p className="text-xs text-[#B42318] bg-[#B42318]/10 p-2 rounded border border-[#B42318]/20">
          {geoError}
        </p>
      )}

      <div className="h-64 w-full rounded-lg overflow-hidden border border-[#DCE2E8] shadow-sm relative">
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <CenterUpdater center={[latitude, longitude]} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler
            onChange={(lat, lng) => {
              onChange(lat, lng);
            }}
          />
          <Marker
            position={[latitude, longitude]}
            icon={pinIcon}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
          />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#697786] bg-[#F4F6F8] p-1.5 rounded border border-[#DCE2E8]">
        <span>Latitude: {latitude.toFixed(6)}</span>
        <span>Longitude: {longitude.toFixed(6)}</span>
      </div>
    </div>
  );
};
