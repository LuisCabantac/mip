"use client";

import L from "leaflet";
import { Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  center: [number, number];
  zoom?: number;
}

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    if (map && map.getContainer()) {
      const timer = setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (error) {
          console.warn("Map invalidateSize error:", error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [map]);

  return null;
}

export default function Map({ center, zoom = 8 }: MapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  const safeZoom = Math.min(zoom, 15);

  // Create a unique key based on center coordinates to force remount when location changes significantly
  const mapKey = `${Math.round(center[0] * 1000)}-${Math.round(
    center[1] * 1000
  )}`;

  const handleMapReady = () => {
    setTimeout(() => {
      try {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      } catch (error) {
        console.warn("Map ready error:", error);
      }
    }, 200);
  };

  return (
    <div className="w-full border overflow-hidden rounded-lg h-[300px]">
      <MapContainer
        key={mapKey}
        ref={mapRef}
        center={center}
        zoom={safeZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        attributionControl={false}
        whenReady={handleMapReady}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <div className="text-center">
              <strong>IP Location</strong>
              <br />
              <small>
                {center[0].toFixed(4)}, {center[1].toFixed(4)}
              </small>
            </div>
          </Popup>
        </Marker>
        <MapResizer />
      </MapContainer>
    </div>
  );
}
