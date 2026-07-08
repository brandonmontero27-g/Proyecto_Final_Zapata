import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Centro por defecto del mapa: Lima, Peru (ciudad con mas publicaciones).
const PERU_CENTER = [-12.0464, -77.0428];

function priceIcon(price, isSelected) {
  const bg = isSelected ? "#2c4a80" : "#dc2626";
  const text = "#ffffff";
  const border = isSelected ? "#7fa8e0" : "#ffffff";
  return L.divIcon({
    className: "",
    html: `<div style="background:${bg};color:${text};border:2px solid ${border};border-radius:9999px;padding:3px 9px;font-size:10px;font-weight:900;font-family:'JetBrains Mono',monospace;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.5);">S/.${Number(price).toLocaleString("es-PE")}</div>`,
    iconSize: [64, 26],
    iconAnchor: [32, 13]
  });
}

function clusterIcon(cluster) {
  return L.divIcon({
    html: `<div style="background:#dc2626;color:#fff;border:2px solid white;border-radius:9999px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;font-family:'JetBrains Mono',monospace;box-shadow:0 2px 8px rgba(0,0,0,.5);">${cluster.getChildCount()}</div>`,
    className: "",
    iconSize: [36, 36]
  });
}

// Ajusta el zoom/centro para que todos los pines queden visibles cuando
// cambia la lista de motos geolocalizadas.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

export default function MotorcyclesMap({ listings, onSelectListing, selectedListingId }) {
  const geolocated = useMemo(
    () => listings.filter((l) => l.coordinate_y != null && l.coordinate_x != null),
    [listings]
  );

  const points = useMemo(
    () => (geolocated.length > 0 ? geolocated.map((l) => [l.coordinate_y, l.coordinate_x]) : [PERU_CENTER]),
    [geolocated]
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 h-96 relative">
      <MapContainer
        center={PERU_CENTER}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />

        <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon}>
          {geolocated.map((moto) => (
            <Marker
              key={moto.id}
              position={[moto.coordinate_y, moto.coordinate_x]}
              icon={priceIcon(moto.price, moto.id === selectedListingId)}
              eventHandlers={{ click: () => onSelectListing(moto) }}
            >
              <Popup>
                <div className="space-y-0.5 text-xs">
                  <strong className="block">{moto.brand} {moto.model} {moto.year}</strong>
                  <span className="block text-slate-500">{moto.location}</span>
                  <span className="block font-black text-red-600">S/. {Number(moto.price).toLocaleString("es-PE")}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm px-3.5 py-2 rounded-xl text-[10px] text-moto-gray-light font-bold border border-white/10 flex items-center justify-between z-[1000] pointer-events-none">
        <span>📍 {geolocated.length} de {listings.length} motos ubicadas en el mapa</span>
        <span className="text-moto-red-light">MotoMarket</span>
      </div>
    </div>
  );
}
