'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Device, Position, Geofence, DeviceStatus } from '@/types';
import { formatSpeed, formatRelativeTime, cn } from '@/lib/utils';
import { useUIStore } from '@/store';

// Fix for default marker icons in Next.js
const createCustomIcon = (status: DeviceStatus, isSelected: boolean = false, course: number = 0) => {
  const colors = {
    [DeviceStatus.ONLINE]: '#22c55e',
    [DeviceStatus.MOVING]: '#22c55e',
    [DeviceStatus.IDLE]: '#eab308',
    [DeviceStatus.STOPPED]: '#f97316',
    [DeviceStatus.OFFLINE]: '#6b7280',
    [DeviceStatus.NO_GPS]: '#f97316',
  };

  const color = colors[status] || colors[DeviceStatus.OFFLINE];
  const size = isSelected ? 48 : 36;
  const arrowSize = size * 0.6;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: white;
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      ">
        <div style="
          width: ${size * 0.7}px;
          height: ${size * 0.7}px;
          background-color: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.2;
          position: absolute;
        "></div>
        <svg width="${arrowSize}" height="${arrowSize}" viewBox="0 0 24 24" fill="${color}" style="transform: rotate(${course}deg); transition: transform 0.3s ease;">
          <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Component to handle map view changes
function MapController({ center, zoom, selectedDevice, devices, trailPositions }: { 
  center?: [number, number]; 
  zoom?: number;
  selectedDevice?: Device | null;
  devices: Device[];
  trailPositions?: Position[];
}) {
  const map = useMap();
  const hasFitBounds = useRef(false);
  
  useEffect(() => {
    if (trailPositions && trailPositions.length > 0 && !hasFitBounds.current) {
      // Fit bounds to the entire trail
      const bounds = L.latLngBounds(trailPositions.map(p => [p.latitude, p.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
        hasFitBounds.current = true;
      }
    } else if (selectedDevice?.lastPosition) {
      map.flyTo(
        [selectedDevice.lastPosition.latitude, selectedDevice.lastPosition.longitude],
        16,
        { duration: 1.5 }
      );
    } else if (devices.length > 0 && !hasFitBounds.current && !center) {
      // Fit bounds to all devices on initial load if no center provided
      const bounds = L.latLngBounds(devices.map(d => [d.lastPosition?.latitude || 0, d.lastPosition?.longitude || 0] as L.LatLngTuple).filter(p => p[0] !== 0));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
        hasFitBounds.current = true;
      }
    } else if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [map, center, zoom, selectedDevice, devices, trailPositions]);

  return null;
}

interface TrackingMapProps {
  devices: Device[];
  selectedDevice?: Device | null;
  onDeviceSelect?: (device: Device) => void;
  geofences?: Geofence[];
  showTrail?: boolean;
  trailPositions?: Position[];
  startPosition?: Position;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

export function TrackingMap({
  devices,
  selectedDevice,
  onDeviceSelect,
  geofences = [],
  showTrail = false,
  trailPositions = [],
  startPosition,
  center,
  zoom = 12,
  height = '100%',
  className,
}: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { darkMode } = useUIStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div 
        className={cn('bg-gray-100 dark:bg-dark-card rounded-lg animate-pulse flex items-center justify-center', className)}
        style={{ height }}
      >
        <span className="text-gray-400">Loading map...</span>
      </div>
    );
  }

  const tileLayerUrl = darkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const startIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: white;
        border: 2px solid #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <div style="width: 12px; height: 12px; background-color: #22c55e; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className={cn('rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-dark-border relative z-0', className)} style={{ height }}>
      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          @apply bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg shadow-xl;
        }
        .leaflet-popup-tip {
          @apply bg-white dark:bg-slate-800;
        }
      `}</style>
      
      <MapContainer
        center={center || [40.7128, -74.006]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution={attribution}
          url={tileLayerUrl}
        />
        
        <MapController 
          center={center} 
          zoom={zoom} 
          selectedDevice={selectedDevice} 
          devices={devices} 
          trailPositions={trailPositions}
        />

        {/* Start Marker */}
        {startPosition && (
          <Marker 
            position={[startPosition.latitude, startPosition.longitude]} 
            icon={startIcon}
          >
            <Popup>
              <div className="p-1 font-semibold">Start Location</div>
            </Popup>
          </Marker>
        )}

        {/* Render geofences */}
        {geofences.map((geofence) => {
          if (geofence.type === 'CIRCLE' && geofence.area.center && geofence.area.radius) {
            return (
              <Circle
                key={geofence.id}
                center={[geofence.area.center.lat, geofence.area.center.lng]}
                radius={geofence.area.radius}
                pathOptions={{
                  color: geofence.color || '#3B82F6',
                  fillColor: geofence.color || '#3B82F6',
                  fillOpacity: 0.2,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{geofence.name}</p>
                    {geofence.description && (
                      <p className="text-gray-500">{geofence.description}</p>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          }
          
          if ((geofence.type === 'POLYGON' || geofence.type === 'RECTANGLE') && geofence.area.coordinates) {
            return (
              <Polygon
                key={geofence.id}
                positions={geofence.area.coordinates.map(c => [c.lat, c.lng])}
                pathOptions={{
                  color: geofence.color || '#3B82F6',
                  fillColor: geofence.color || '#3B82F6',
                  fillOpacity: 0.2,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{geofence.name}</p>
                    {geofence.description && (
                      <p className="text-gray-500">{geofence.description}</p>
                    )}
                  </div>
                </Popup>
              </Polygon>
            );
          }
          
          return null;
        })}

        {/* Render trail for selected device */}
        {showTrail && trailPositions.length > 1 && (
          <Polyline
            positions={trailPositions.map(p => [p.latitude, p.longitude])}
            pathOptions={{
              color: '#6366f1',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10', 
            }}
          />
        )}

        {/* Render device markers */}
        {devices.map((device) => {
          if (!device.lastPosition) return null;
          
          const isSelected = selectedDevice?.id === device.id;
          
          return (
            <Marker
              key={device.id}
              position={[device.lastPosition.latitude, device.lastPosition.longitude]}
              icon={createCustomIcon(device.status, isSelected, device.lastPosition.course)}
              eventHandlers={{
                click: () => onDeviceSelect?.(device),
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-1">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{device.name}</h3>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      device.status === DeviceStatus.MOVING && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      device.status === DeviceStatus.IDLE && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                      device.status === DeviceStatus.OFFLINE && 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400',
                    )}>
                      {device.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                      <span className="font-medium">{formatSpeed(device.lastPosition.speed)}</span>
                      
                      <span className="text-gray-500 dark:text-gray-400">Course:</span>
                      <span className="font-medium">{Math.round(device.lastPosition.course)}°</span>

                      <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                      <span className="font-medium col-span-2">{formatRelativeTime(device.lastPosition.deviceTime)}</span>
                    </div>

                    {device.attributes?.licensePlate && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                         <span className="text-gray-500 dark:text-gray-400">Plate:</span>
                         <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{device.attributes.licensePlate}</span>
                      </div>
                    )}
                    
                    {device.attributes?.driverName && (
                      <div className="flex justify-between">
                         <span className="text-gray-500 dark:text-gray-400">Driver:</span>
                         <span className="font-medium">{device.attributes.driverName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
