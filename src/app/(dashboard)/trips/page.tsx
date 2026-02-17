'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, Button, Input, Select, Badge } from '@/components/ui';
import { ridesApi, devicesApi } from '@/services/api';
import { Ride, RideStatus, Device } from '@/types';
import { formatDistance, formatDuration, formatSpeed, formatDateTime, formatRelativeTime, cn } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TripsPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [ridesData, devicesData] = await Promise.all([
          ridesApi.getAll(),
          devicesApi.getAll(),
        ]);
        setRides(ridesData);
        setDevices(devicesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRides = useMemo(() => {
    let filtered = rides;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.deviceName?.toLowerCase().includes(searchLower) ||
        r.startStation?.name?.toLowerCase().includes(searchLower) ||
        r.endStation?.name?.toLowerCase().includes(searchLower)
      );
    }

    if (deviceFilter) {
      filtered = filtered.filter(r => r.deviceId === deviceFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(r => new Date(r.startTime) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter(r => new Date(r.startTime) <= new Date(dateRange.end));
    }

    return filtered;
  }, [rides, search, deviceFilter, statusFilter, dateRange]);

  const deviceOptions = [
    { value: '', label: 'All Devices' },
    ...devices.map(d => ({ value: d.id, label: d.name })),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: RideStatus.IN_PROGRESS, label: 'In Progress' },
    { value: RideStatus.ENDED, label: 'Completed' },
  ];

  const stats = useMemo(() => {
    const completed = rides.filter(r => r.status === RideStatus.ENDED);
    const totalDistance = completed.reduce((sum, r) => sum + (r.distance || 0), 0);
    const totalDuration = completed.reduce((sum, r) => sum + (r.duration || 0), 0);
    
    return {
      total: rides.length,
      inProgress: rides.filter(r => r.status === RideStatus.IN_PROGRESS).length,
      completed: completed.length,
      totalDistance,
      totalDuration,
    };
  }, [rides]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Trip History</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            View and analyze all completed and ongoing trips
          </p>
        </div>
        <Button variant="outline">
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card padding="sm">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Total Trips</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{stats.total}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-gray-500 dark:text-dark-muted">In Progress</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.inProgress}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Completed</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.completed}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Total Distance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            {formatDistance(stats.totalDistance)}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Total Duration</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            {formatDuration(stats.totalDuration)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              options={deviceOptions}
              className="w-48"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="w-40"
            />
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-40"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Trips list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-dark-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredRides.length === 0 ? (
        <Card className="text-center py-12">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
            No trips found
          </h3>
          <p className="text-gray-500 dark:text-dark-muted">
            Try adjusting your filters or date range
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <Card
              key={ride.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Device and route info */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    ride.status === RideStatus.IN_PROGRESS
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted'
                  )}>
                    <TruckIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                        {ride.deviceName || `Device ${ride.deviceId}`}
                      </h3>
                      <Badge
                        variant={ride.status === RideStatus.IN_PROGRESS ? 'success' : 'default'}
                        size="sm"
                      >
                        {ride.status === RideStatus.IN_PROGRESS ? 'Active' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-dark-muted">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{ride.startStation?.name || 'Start'}</span>
                      <ArrowRightIcon className="h-4 w-4" />
                      <span>{ride.endStation?.name || 'In Progress...'}</span>
                    </div>
                  </div>
                </div>

                {/* Trip details */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-dark-muted">Distance</p>
                    <p className="font-semibold text-gray-900 dark:text-dark-text">
                      {ride.distance ? formatDistance(ride.distance) : '-'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-dark-muted">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-dark-text">
                      {ride.duration ? formatDuration(ride.duration) : '-'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-dark-muted">Avg Speed</p>
                    <p className="font-semibold text-gray-900 dark:text-dark-text">
                      {ride.avgSpeed ? formatSpeed(ride.avgSpeed) : '-'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-dark-muted">Started</p>
                    <p className="font-semibold text-gray-900 dark:text-dark-text">
                      {formatRelativeTime(ride.startTime)}
                    </p>
                  </div>
                  <Link
                    href={`/trips/${ride.id}`}
                    className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
