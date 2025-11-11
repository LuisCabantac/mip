"use client";

import L from "leaflet";
import { Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";
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

function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      map &&
      center &&
      center.length === 2 &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      const safeZoom = Math.min(zoom, 15);

      try {
        map.setView(center, safeZoom);
      } catch {}
    } else {
    }
  }, [map, center, zoom]);

  return null;
}

function TileLayerComponent() {
  const map = useMap();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (map && map.getContainer() && map.getPanes()) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [map]);

  if (!isReady) {
    return null;
  }

  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
}

export default function Map({ center, zoom = 8 }: MapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  const safeZoom = Math.min(zoom, 15);

  return (
    <div className="w-full border overflow-hidden rounded-lg h-[300px]">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={safeZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        attributionControl={false}
        whenReady={() => {
          setTimeout(() => {
            try {
              mapRef.current?.invalidateSize();
            } catch (error) {
              console.warn("Map invalidateSize error in whenReady:", error);
            }
          }, 200);
        }}
      >
        <MapUpdater center={center} zoom={safeZoom} />
        <TileLayerComponent />
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
