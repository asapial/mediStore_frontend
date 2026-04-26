"use client";

import { useState, useCallback, useRef } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  FullscreenControl,
  MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Map style — OpenFreeMap liberty (free, no API key) ────────────────────────
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// ── Bangladesh default view ───────────────────────────────────────────────────
const BANGLADESH_VIEW = { longitude: 90.3563, latitude: 23.6850, zoom: 6.8 };

// ── Types ─────────────────────────────────────────────────────────────────────
export type MapWarehouse = {
  id: string; name: string; address: string; city: string;
  lat: number; lng: number; phone?: string; isActive: boolean;
  manager: { name: string; email: string };
  _count?: { locationStocks: number; fulfillmentTasks: number };
};

// ── Animated warehouse pin ────────────────────────────────────────────────────
function WarehousePin({ active }: { active: boolean }) {
  const bg = active ? "#0EA5E9" : "#EF4444";
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
      {active && (
        <div style={{
          position: "absolute", top: -4, left: -4,
          width: 44, height: 44, borderRadius: "50%",
          border: `2px solid ${bg}`, opacity: 0.4,
          animation: "wh-pulse 2s infinite",
        }} />
      )}
      <div style={{
        width: 36, height: 36,
        borderRadius: "50% 50% 50% 0",
        transform: "rotate(-45deg)",
        background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
        border: "3px solid #fff",
        boxShadow: `0 4px 16px ${bg}55, 0 2px 8px rgba(0,0,0,0.2)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ transform: "rotate(45deg)", fontSize: 16, lineHeight: 1 }}>🏭</span>
      </div>
      <div style={{
        width: 0, height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: `8px solid ${bg}`,
        marginTop: -1,
      }} />
      <style>{`
        @keyframes wh-pulse {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(1.6); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

// ── Popup card ────────────────────────────────────────────────────────────────
function WarehouseCard({ w, onClose }: { w: MapWarehouse; onClose: () => void }) {
  return (
    <Popup
      longitude={w.lng} latitude={w.lat}
      anchor="bottom"
      offset={[0, -52] as [number, number]}
      onClose={onClose}
      closeButton={false}
      maxWidth="260px"
    >
      <div style={{ fontFamily: "'Inter', sans-serif", borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 240 }}>
        {/* Header */}
        <div style={{
          background: w.isActive ? "linear-gradient(135deg,#0EA5E9,#0284C7)" : "linear-gradient(135deg,#EF4444,#DC2626)",
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏭</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</p>
            <span style={{ display: "inline-block", marginTop: 2, fontSize: 9, fontWeight: 800, letterSpacing: 1, padding: "1px 7px", borderRadius: 999, background: "rgba(255,255,255,0.25)", color: "#fff" }}>
              {w.isActive ? "● ACTIVE" : "○ INACTIVE"}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, width: 24, height: 24, cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 12, marginTop: 1 }}>📍</span>
            <p style={{ margin: 0, fontSize: 11, color: "#5C4033", lineHeight: 1.5 }}>{w.address}, {w.city}</p>
          </div>
          {w.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12 }}>📞</span>
              <p style={{ margin: 0, fontSize: 11, color: "#5C4033" }}>{w.phone}</p>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12 }}>👤</span>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#7C3AED" }}>{w.manager.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#8A6650" }}>{w.manager.email}</p>
            </div>
          </div>
          {w._count && (
            <div style={{ display: "flex", gap: 6, marginTop: 4, paddingTop: 8, borderTop: "1px solid #F0E8E0" }}>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "#0EA5E918", color: "#0EA5E9", fontWeight: 700 }}>{w._count.locationStocks} SKUs</span>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "#D9770618", color: "#D97706", fontWeight: 700 }}>{w._count.fulfillmentTasks} tasks</span>
            </div>
          )}
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "#bbb", fontFamily: "monospace" }}>{w.lat.toFixed(4)}, {w.lng.toFixed(4)}</p>
        </div>
      </div>
    </Popup>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WarehouseMap({ warehouses }: { warehouses: MapWarehouse[] }) {
  const [selected, setSelected] = useState<MapWarehouse | null>(null);
  const mapRef = useRef<MapRef>(null);

  const handleMarkerClick = useCallback((w: MapWarehouse) => setSelected(w), []);

  // Auto-fit to show ALL markers once the map is ready
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current;
    if (!map || warehouses.length === 0) return;

    if (warehouses.length === 1) {
      map.flyTo({ center: [warehouses[0].lng, warehouses[0].lat], zoom: 11, duration: 1000 });
      return;
    }

    // Compute bounding box across ALL warehouses
    const lngs = warehouses.map(w => w.lng);
    const lats = warehouses.map(w => w.lat);

    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: { top: 80, bottom: 80, left: 80, right: 80 }, duration: 1200 }
    );
  }, [warehouses]);

  return (
    <Map
      ref={mapRef}
      initialViewState={BANGLADESH_VIEW}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
      onLoad={handleMapLoad}
    >
      <NavigationControl position="top-right" />
      <ScaleControl position="bottom-right" />
      <FullscreenControl position="top-right" />

      {/* All warehouse markers */}
      {warehouses.map(w => (
        <Marker
          key={w.id}
          longitude={w.lng}
          latitude={w.lat}
          anchor="bottom"
          onClick={() => handleMarkerClick(w)}
        >
          <WarehousePin active={w.isActive} />
        </Marker>
      ))}

      {/* Selected popup */}
      {selected && <WarehouseCard w={selected} onClose={() => setSelected(null)} />}
    </Map>
  );
}
