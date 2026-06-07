import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CycleData } from '@/hooks/useCycleData';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGVzdHVzZXIiLCJhIjoiY2x0b284dHQzMGF0ajJpcGMzZzQzNmN5dCJ9.YOUR_FALLBACK_TOKEN_HERE'; // In production, use env variables

// Sample geofence roughly centered around a target location
const geofenceData = {
  type: 'Feature' as const,
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[
      [-122.42, 37.78],
      [-122.41, 37.78],
      [-122.41, 37.77],
      [-122.42, 37.77],
      [-122.42, 37.78]
    ]]
  }
};

export function CycleMap({ cycles }: { cycles: CycleData[] }) {
  const [viewState, setViewState] = useState({
    longitude: -122.415,
    latitude: 37.775,
    zoom: 14,
    pitch: 45,
    bearing: -17.6
  });

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        
        {/* Geofence Layer */}
        <Source id="geofence" type="geojson" data={geofenceData}>
          <Layer 
            id="geofence-fill" 
            type="fill" 
            paint={{
              'fill-color': '#00ffcc',
              'fill-opacity': 0.1
            }} 
          />
          <Layer 
            id="geofence-outline" 
            type="line" 
            paint={{
              'line-color': '#00ffcc',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }} 
          />
        </Source>

        {/* Cycle Markers */}
        {cycles.map((cycle) => (
          <Marker 
            key={cycle.id} 
            longitude={cycle.location_lng} 
            latitude={cycle.location_lat} 
            anchor="bottom"
          >
            <div className="relative group cursor-pointer">
              <div className={`w-4 h-4 rounded-full border-2 border-black ${cycle.status === 'in-use' ? 'bg-amber-400' : 'bg-emerald-400'} shadow-[0_0_10px_rgba(52,211,153,0.8)]`} />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md border border-white/10">
                {cycle.status === 'in-use' ? 'In Use' : 'Available'} • {cycle.battery_percentage}%
              </div>
            </div>
          </Marker>
        ))}
        
        {/* Mock Marker if no data */}
        {cycles.length === 0 && (
           <Marker longitude={-122.415} latitude={37.775} anchor="bottom">
            <div className="relative">
              <div className="w-5 h-5 rounded-full border-2 border-black bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
