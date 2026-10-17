'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

// Same base map as the Fink web app (traccar-web): OpenFreeMap vector tiles, free and allowed for
// commercial use. "liberty" in light mode, "dark" in dark mode. Override with NEXT_PUBLIC_MAP_STYLE_URL.
const OPENFREEMAP = 'https://tiles.openfreemap.org/styles';

export const mapStyleUrl = (darkMode: boolean) =>
  process.env.NEXT_PUBLIC_MAP_STYLE_URL || `${OPENFREEMAP}/${darkMode ? 'dark' : 'liberty'}`;

const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
  '&copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> ' +
  'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

let rtlRequested = false;

// Draws the vector map under Leaflet's markers, routes and geofences
export function VectorBasemap({ darkMode }: { darkMode: boolean }) {
  const map = useMap();

  useEffect(() => {
    let layer: L.Layer | null = null;
    let cancelled = false;

    // Loaded in the browser only: MapLibre needs window and WebGL
    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('@maplibre/maplibre-gl-leaflet');
      if (cancelled) return;

      // Arabic place names are written right to left (file copied to public/ on install)
      if (!rtlRequested && maplibregl.getRTLTextPluginStatus() === 'unavailable') {
        rtlRequested = true;
        maplibregl.setRTLTextPlugin('/mapbox-gl-rtl-text.js', true).catch(() => {});
      }

      layer = (L as unknown as { maplibreGL: (options: object) => L.Layer })
        .maplibreGL({ style: mapStyleUrl(darkMode), attribution: ATTRIBUTION })
        .addTo(map);
    })();

    return () => {
      cancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map, darkMode]);

  return null;
}
