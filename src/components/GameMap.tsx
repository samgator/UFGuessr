"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { UF_CAMPUS_CENTER, UF_CAMPUS_BOUNDS } from "@/lib/geo";

// Resolve Next.js Leaflet default marker icon path issue
const fixLeafletIcon = () => {
  // @ts-expect-error - Prototype lacks type definitions in Leaflet typing exports
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

// Custom icons
const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const redIcon = createCustomIcon("red");     // User guess
const greenIcon = createCustomIcon("green"); // Actual location
const blueIcon = createCustomIcon("blue");   // Admin / general selection

// Click handler inside Leaflet
function MapClickHandler({ onClick, enabled }: { onClick?: (lat: number, lng: number) => void; enabled: boolean }) {
  useMapEvents({
    click(e) {
      if (enabled && onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Recenter map when result is shown
function MapRecenter({
  userGuess,
  actualLocation,
  showResult,
}: {
  userGuess?: [number, number] | null;
  actualLocation?: [number, number] | null;
  showResult: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (showResult && userGuess && actualLocation) {
      const bounds = L.latLngBounds([userGuess, actualLocation]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    } else if (!showResult && !userGuess && actualLocation) {
      // Admin editing recenter
      map.setView(actualLocation, 16);
    }
  }, [userGuess, actualLocation, showResult, map]);

  return null;
}

// Auto-resizer to continuously notify Leaflet when container dimensions change (mobile viewports, fullscreen toggles)
function MapResizer({ isMapFullscreen }: { isMapFullscreen?: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map, isMapFullscreen]);

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

interface GameMapProps {
  onMapClick?: (lat: number, lng: number) => void;
  userGuess?: [number, number] | null;
  actualLocation?: [number, number] | null;
  showResult?: boolean;
  readonly?: boolean;
  isMapFullscreen?: boolean;
}

export default function GameMap({
  onMapClick,
  userGuess,
  actualLocation,
  showResult = false,
  readonly = false,
  isMapFullscreen = false,
}: GameMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcon();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse text-gray-500 rounded-xl font-medium border border-white/10">
        Loading Map...
      </div>
    );
  }

  // Determine standard bounds and center
  const bounds = L.latLngBounds(UF_CAMPUS_BOUNDS);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <MapContainer
        center={UF_CAMPUS_CENTER}
        zoom={15}
        minZoom={13}
        maxZoom={18}
        maxBounds={bounds}
        maxBoundsViscosity={0.7}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxNativeZoom={19}
          maxZoom={19}
          keepBuffer={10}
          updateWhenIdle={false}
          updateWhenZooming={false}
        />

        <MapResizer isMapFullscreen={isMapFullscreen} />

        <MapClickHandler onClick={onMapClick} enabled={!readonly && !showResult} />

        {/* User's guess marker */}
        {userGuess && (
          <Marker
            position={userGuess}
            icon={showResult ? redIcon : blueIcon}
          />
        )}

        {/* Actual target location marker */}
        {showResult && actualLocation && (
          <Marker
            position={actualLocation}
            icon={greenIcon}
          />
        )}

        {/* Line connecting guess to actual */}
        {showResult && userGuess && actualLocation && (
          <Polyline
            positions={[userGuess, actualLocation]}
            color="#3b82f6"
            weight={4}
            dashArray="10, 10"
            className="animate-[dash_2s_linear_infinite]"
          />
        )}

        <MapRecenter
          userGuess={userGuess}
          actualLocation={actualLocation}
          showResult={showResult}
        />
      </MapContainer>
    </div>
  );
}
