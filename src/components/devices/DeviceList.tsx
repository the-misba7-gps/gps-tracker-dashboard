'use client';

import { useState, useMemo } from 'react';
import { Device, DeviceStatus, DeviceFilter } from '@/types';
import { DeviceCard } from './DeviceCard';
import { Input, Select, Badge } from '@/components/ui';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface DeviceListProps {
  devices: Device[];
  selectedDevice?: Device | null;
  onDeviceSelect?: (device: Device) => void;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
}

export function DeviceList({
  devices,
  selectedDevice,
  onDeviceSelect,
  isLoading,
  compact = false,
  className,
}: DeviceListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDevices = useMemo(() => {
    let filtered = devices;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.imei.includes(search) ||
        d.attributes?.licensePlate?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    return filtered;
  }, [devices, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: devices.length,
      [DeviceStatus.MOVING]: devices.filter(d => d.status === DeviceStatus.MOVING).length,
      [DeviceStatus.IDLE]: devices.filter(d => d.status === DeviceStatus.IDLE || d.status === DeviceStatus.STOPPED).length,
      [DeviceStatus.OFFLINE]: devices.filter(d => d.status === DeviceStatus.OFFLINE).length,
    };
  }, [devices]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: DeviceStatus.ONLINE, label: 'Online' },
    { value: DeviceStatus.MOVING, label: 'Moving' },
    { value: DeviceStatus.IDLE, label: 'Idle' },
    { value: DeviceStatus.STOPPED, label: 'Stopped' },
    { value: DeviceStatus.OFFLINE, label: 'Offline' },
  ];

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 dark:bg-dark-card rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search and filters */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-lg border border-gray-300 dark:border-dark-border',
              'hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
              showFilters && 'bg-primary-50 border-primary-500 dark:bg-primary-900/20'
            )}
          >
            <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-dark-muted" />
          </button>
        </div>

        {showFilters && (
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            placeholder="Filter by status"
          />
        )}

        {/* Quick status filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full transition-colors',
              !statusFilter 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted hover:bg-gray-200'
            )}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter(DeviceStatus.MOVING)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full transition-colors',
              statusFilter === DeviceStatus.MOVING
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted hover:bg-gray-200'
            )}
          >
            Moving ({statusCounts[DeviceStatus.MOVING]})
          </button>
          <button
            onClick={() => setStatusFilter(DeviceStatus.IDLE)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full transition-colors',
              statusFilter === DeviceStatus.IDLE
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted hover:bg-gray-200'
            )}
          >
            Idle ({statusCounts[DeviceStatus.IDLE]})
          </button>
          <button
            onClick={() => setStatusFilter(DeviceStatus.OFFLINE)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full transition-colors',
              statusFilter === DeviceStatus.OFFLINE
                ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted hover:bg-gray-200'
            )}
          >
            Offline ({statusCounts[DeviceStatus.OFFLINE]})
          </button>
        </div>
      </div>

      {/* Device list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredDevices.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-dark-muted">
            No devices found
          </div>
        ) : (
          filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isSelected={selectedDevice?.id === device.id}
              onClick={() => onDeviceSelect?.(device)}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  );
}
