'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { useDevices } from '@/hooks/useDevices';
import { dashboardApi, alertsApi, ridesApi } from '@/services/api';
import { DashboardStats, Alert, Ride, DeviceStatus } from '@/types';
import { formatDistance, formatRelativeTime, cn } from '@/lib/utils';
import {
  TruckIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  MapIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Dynamic import for map to avoid SSR issues
const TrackingMap = dynamic(
  () => import('@/components/maps/TrackingMap').then(mod => mod.TrackingMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 dark:bg-dark-card rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading map...</span>
      </div>
    )
  }
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <Card className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-dark-muted">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mt-1">{value}</p>
          {trend && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <ArrowTrendingUpIcon className={cn(
                'h-4 w-4 mr-1',
                !trend.isPositive && 'rotate-180'
              )} />
              <span>{trend.value}% from yesterday</span>
            </div>
          )}
        </div>
        <div className={cn('stat-card-icon', colors[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { devices, selectedDevice, selectDevice, isLoading: devicesLoading } = useDevices();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, alertsData, ridesData] = await Promise.all([
          dashboardApi.getStats(),
          alertsApi.getAll({ isRead: false }),
          ridesApi.getAll(),
        ]);
        setStats(statsData);
        setRecentAlerts(alertsData.slice(0, 5));
        setRecentRides(ridesData.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const activeDevices = devices.filter(d => d.status !== DeviceStatus.OFFLINE);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Dashboard</h1>
          <p className="text-gray-500 dark:text-dark-muted mt-1">
            Overview of your fleet and tracking system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tracking"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <MapIcon className="h-5 w-5 mr-2" />
            Live Tracking
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Devices"
          value={stats?.totalDevices || 0}
          icon={<TruckIcon className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Online Now"
          value={stats?.onlineDevices || 0}
          icon={<SignalIcon className="h-6 w-6" />}
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Distance Today"
          value={formatDistance((stats?.totalDistance || 0) * 1000)}
          icon={<MapIcon className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Active Alerts"
          value={stats?.criticalAlerts || 0}
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          color={stats?.criticalAlerts ? 'red' : 'yellow'}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map section */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                  Live Map
                </h2>
                <Badge variant="success" dot>
                  {activeDevices.length} active
                </Badge>
              </div>
            </div>
            <TrackingMap
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceSelect={selectDevice}
              height="400px"
            />
          </Card>
        </div>

        {/* Active devices panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Active Devices</CardTitle>
              <Link 
                href="/devices" 
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[360px] overflow-y-auto">
              {devicesLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-dark-border rounded-lg animate-pulse" />
                ))
              ) : activeDevices.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-dark-muted py-8">
                  No active devices
                </p>
              ) : (
                activeDevices.slice(0, 5).map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    isSelected={selectedDevice?.id === device.id}
                    onClick={() => selectDevice(device)}
                    compact
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BellAlertIcon className="h-5 w-5 mr-2 text-red-500" />
              Recent Alerts
            </CardTitle>
            <Link 
              href="/alerts" 
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-dark-border rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentAlerts.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-dark-muted py-8">
                No recent alerts
              </p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        'w-2 h-2 rounded-full mr-3',
                        alert.severity === 'CRITICAL' && 'bg-red-500',
                        alert.severity === 'WARNING' && 'bg-yellow-500',
                        alert.severity === 'INFO' && 'bg-blue-500',
                      )} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                          {alert.deviceName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(alert.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-primary-500" />
              Recent Trips
            </CardTitle>
            <Link 
              href="/trips" 
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-dark-border rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentRides.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-dark-muted py-8">
                No recent trips
              </p>
            ) : (
              <div className="space-y-3">
                {recentRides.map((ride) => (
                  <Link
                    key={ride.id}
                    href={`/trips/${ride.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center mr-3',
                        ride.status === 'IN_PROGRESS' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        <TruckIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                          {ride.deviceName || `Device ${ride.deviceId}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted">
                          {ride.distance ? formatDistance(ride.distance) : 'In progress'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={ride.status === 'IN_PROGRESS' ? 'success' : 'default'}
                        size="sm"
                      >
                        {ride.status === 'IN_PROGRESS' ? 'Active' : 'Completed'}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(ride.startTime)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
