'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, Badge, Button } from '@/components/ui';
import { DeviceList } from '@/components/devices/DeviceList';
import { useDevices } from '@/hooks/useDevices';
import { useGeofenceStore } from '@/store';
import { formatSpeed, formatRelativeTime, formatDistance, cn } from '@/lib/utils';
import { geofencesApi } from '@/services/api';
import {
  MapPinIcon,
  SignalIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { DeviceStatus } from '@/types';

// Dynamic import for map to avoid SSR issues
const TrackingMap = dynamic(
  () => import('@/components/maps/TrackingMap').then(mod => mod.TrackingMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 dark:bg-dark-card animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading map...</span>
      </div>
    )
  }
);

export default function TrackingPage() {
  const { devices, selectedDevice, selectDevice, isLoading, fetchDevices } = useDevices();
  const { geofences, setGeofences } = useGeofenceStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);

  useEffect(() => {
    async function loadGeofences() {
      try {
        const data = await geofencesApi.getAll();
        setGeofences(data);
      } catch (error) {
        console.error('Failed to load geofences:', error);
      }
    }
    loadGeofences();
  }, [setGeofences]);

  const handleRefresh = () => {
    fetchDevices();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Live Tracking</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            Real-time location of all your devices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGeofences(!showGeofences)}
            className={showGeofences ? 'bg-primary-50 border-primary-500' : ''}
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Geofences
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <ArrowPathIcon className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar toggle for mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-20 bg-white dark:bg-dark-card shadow-lg rounded-full p-3"
        >
          {sidebarOpen ? (
            <ChevronLeftIcon className="h-6 w-6" />
          ) : (
            <ChevronRightIcon className="h-6 w-6" />
          )}
        </button>

        {/* Device list sidebar */}
        <div
          className={cn(
            'fixed lg:relative inset-y-0 left-0 z-10 w-80 lg:w-96 bg-white dark:bg-dark-card lg:rounded-xl shadow-lg lg:shadow-sm transition-transform duration-300 flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
          )}
          style={{ top: 'auto', height: 'auto', maxHeight: '100%' }}
        >
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="p-4 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-dark-text">Devices</h2>
              <Badge variant="info">{devices.length} total</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <DeviceList
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceSelect={selectDevice}
              isLoading={isLoading}
              compact
              className="h-full"
            />
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Selected device info bar */}
          {selectedDevice && (
            <Card className="mb-4 animate-slideUp" padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    selectedDevice.status === DeviceStatus.MOVING 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted'
                  )}>
                    <SignalIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                      {selectedDevice.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-muted">
                      {selectedDevice.attributes?.licensePlate || selectedDevice.imei}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {selectedDevice.lastPosition && (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-dark-muted">Speed</p>
                        <p className="font-semibold text-gray-900 dark:text-dark-text">
                          {formatSpeed(selectedDevice.lastPosition.speed)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-dark-muted">Last Update</p>
                        <p className="font-semibold text-gray-900 dark:text-dark-text">
                          {formatRelativeTime(selectedDevice.lastPosition.deviceTime)}
                        </p>
                      </div>
                      {selectedDevice.lastPosition.attributes?.odometer && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-dark-muted">Odometer</p>
                          <p className="font-semibold text-gray-900 dark:text-dark-text">
                            {formatDistance(selectedDevice.lastPosition.attributes.odometer)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectDevice(null)}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Map */}
          <Card className="flex-1" padding="none">
            <TrackingMap
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceSelect={selectDevice}
              geofences={showGeofences ? geofences : []}
              height="100%"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
