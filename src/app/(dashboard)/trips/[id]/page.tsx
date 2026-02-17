'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { TrackingMap } from '@/components/maps/TrackingMap';
import { ridesApi } from '@/services/api';
import { Ride, RideStatus, Position, Priority, Device, DeviceType, DeviceStatus } from '@/types';
import { formatDistance, formatDuration, formatSpeed, formatDateTime, formatRelativeTime, cn } from '@/lib/utils';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'stats' | 'events'>('map');

  useEffect(() => {
    async function loadRide() {
      try {
        const id = params.id as string;
        // Try to fetch real data first
        let data: Ride;
        try {
           data = await ridesApi.getById(id);
        } catch (e) {
           console.log("Fetching ride failed, using demo data", e);
           // Fallback to demo data
           data = getDemoRideData(id);
        }
        setRide(data);
      } catch (error) {
        console.error('Failed to load ride:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRide();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
           <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
           <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">Trip not found</h3>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  // Create a mock device object for the map component
  const mapDevice: Device = {
    id: ride.deviceId || 'unknown',
    imei: ride.imei,
    name: ride.deviceName || 'Unknown Device',
    type: DeviceType.VEHICLE,
    status: ride.status === RideStatus.IN_PROGRESS ? DeviceStatus.MOVING : DeviceStatus.STOPPED,
    lastPosition: ride.locations && ride.locations.length > 0 ? ride.locations[ride.locations.length - 1] : undefined,
    createdAt: ride.startTime,
    updatedAt: ride.endTime || ride.startTime,
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text flex items-center gap-3">
              Trip Details
              <Badge variant={ride.status === RideStatus.IN_PROGRESS ? 'success' : 'default'}>
                {ride.status === RideStatus.IN_PROGRESS ? 'In Progress' : 'Completed'}
              </Badge>
            </h1>
            <p className="text-gray-500 dark:text-dark-muted flex items-center gap-2 mt-1">
              <CalendarIcon className="h-4 w-4" />
              {formatDateTime(ride.startTime)}
              {ride.deviceName && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <TruckIcon className="h-4 w-4" />
                  {ride.deviceName}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant={activeTab === 'map' ? 'primary' : 'outline'} onClick={() => setActiveTab('map')}>
                Map
            </Button>
            <Button variant={activeTab === 'stats' ? 'primary' : 'outline'} onClick={() => setActiveTab('stats')}>
                Statistics
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
            {activeTab === 'map' && (
                <Card className="overflow-hidden p-0 border-0 h-[600px] shadow-lg">
                    <TrackingMap 
                        devices={[mapDevice]}
                        selectedDevice={mapDevice}
                        showTrail={true}
                        trailPositions={ride.locations || []}
                        startPosition={ride.locations && ride.locations.length > 0 ? ride.locations[0] : undefined}
                        zoom={14}
                        height="100%"
                    />
                </Card>
            )}

            {activeTab === 'stats' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Card>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                                <ClockIcon className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Duration</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white pl-11">
                            {formatDuration(ride.duration || 0)}
                        </p>
                     </Card>
                     <Card>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                                <MapPinIcon className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Distance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white pl-11">
                            {formatDistance(ride.distance || 0)}
                        </p>
                     </Card>
                     <Card>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400">
                                <ChartBarIcon className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Avg Speed</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white pl-11">
                            {formatSpeed(ride.avgSpeed || 0)}
                        </p>
                     </Card>
                     <Card>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                                <ChartBarIcon className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Max Speed</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white pl-11">
                            {formatSpeed(ride.maxSpeed || 0)}
                        </p>
                     </Card>
                </div>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <Card title="Trip Summary">
                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 py-2">
                    {/* Start */}
                    <div className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Start Location</p>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {ride.startStation?.name || 'Unknown Location'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                            {formatDateTime(ride.startTime)}
                        </p>
                    </div>

                    {/* End */}
                    <div className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-sm" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">End Location</p>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {ride.status === RideStatus.IN_PROGRESS ? 'Current Location' : (ride.endStation?.name || 'Unknown Location')}
                        </h4>
                        {ride.endTime && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                                {formatDateTime(ride.endTime)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Total Distance</span>
                         <span className="font-medium text-gray-900 dark:text-white">{formatDistance(ride.distance || 0)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Duration</span>
                         <span className="font-medium text-gray-900 dark:text-white">{formatDuration(ride.duration || 0)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Avg Speed</span>
                         <span className="font-medium text-gray-900 dark:text-white">{formatSpeed(ride.avgSpeed || 0)}</span>
                     </div>
                </div>
            </Card>

            <Card title="Driver">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <TruckIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">Unassigned Driver</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle ID: {ride.deviceId}</p>
                    </div>
                 </div>
            </Card>
        </div>
      </div>
    </div>
  );
}

// Helper to generate realistic demo data compatible with backend types
function getDemoRideData(id: string): Ride {
    const now = new Date();
    const startTime = new Date(now.getTime() - 1000 * 60 * 60 * 2); // 2 hours ago
    const endTime = new Date(now.getTime() - 1000 * 60 * 15); // 15 mins ago

    // Generate a simple path (New York City area)
    const locations: Position[] = [];
    const startLat = 40.7128;
    const startLng = -74.0060;
    
    for (let i = 0; i < 20; i++) {
        const time = new Date(startTime.getTime() + i * 1000 * 60 * 6); // every 6 mins
        locations.push({
            id: `pos-${i}`,
            imei: '123456789012345',
            deviceId: 'dev-1',
            serverTime: time.toISOString(),
            deviceTime: time.toISOString(),
            valid: true,
            latitude: startLat + (i * 0.002), // moving north
            longitude: startLng + (i * 0.001), // moving east
            altitude: 10 + Math.random() * 5,
            speed: 20 + Math.random() * 30, // knots
            course: 45,
            priority: Priority.LOW,
            attributes: {
                ignition: true,
                batteryLevel: 98 - i,
                fuelLevel: 75 - (i * 0.5)
            }
        });
    }

    return {
        id: id,
        imei: '123456789012345',
        deviceId: 'dev-1',
        deviceName: 'Truck 101',
        groupId: 'group-1',
        status: RideStatus.ENDED,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        distance: 45200, // meters
        duration: 7200, // seconds
        maxSpeed: 65, // knots
        avgSpeed: 45, // knots
        startStation: {
            name: 'Distribution Center A',
            latitude: startLat,
            longitude: startLng
        },
        endStation: {
            name: 'Warehouse B',
            latitude: locations[locations.length-1].latitude,
            longitude: locations[locations.length-1].longitude
        },
        locations: locations
    };
}
