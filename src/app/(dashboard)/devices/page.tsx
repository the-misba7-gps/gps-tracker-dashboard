'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, Button, Input, Select, Badge, Modal } from '@/components/ui';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { useDevices } from '@/hooks/useDevices';
import { Device, DeviceStatus, DeviceType } from '@/types';
import { formatSpeed, formatRelativeTime, cn } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TableCellsIcon,
  Squares2X2Icon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DevicesPage() {
  const { devices, selectedDevice, selectDevice, isLoading } = useDevices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredDevices = useMemo(() => {
    let filtered = devices;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.imei.includes(search) ||
        d.attributes?.licensePlate?.toLowerCase().includes(searchLower) ||
        d.attributes?.driverName?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(d => d.type === typeFilter);
    }

    return filtered;
  }, [devices, search, statusFilter, typeFilter]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: DeviceStatus.ONLINE, label: 'Online' },
    { value: DeviceStatus.MOVING, label: 'Moving' },
    { value: DeviceStatus.IDLE, label: 'Idle' },
    { value: DeviceStatus.STOPPED, label: 'Stopped' },
    { value: DeviceStatus.OFFLINE, label: 'Offline' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: DeviceType.VEHICLE, label: 'Vehicle' },
    { value: DeviceType.PERSONAL, label: 'Personal' },
    { value: DeviceType.ASSET, label: 'Asset' },
  ];

  const statusCounts = {
    online: devices.filter(d => d.status !== DeviceStatus.OFFLINE).length,
    moving: devices.filter(d => d.status === DeviceStatus.MOVING).length,
    idle: devices.filter(d => d.status === DeviceStatus.IDLE || d.status === DeviceStatus.STOPPED).length,
    offline: devices.filter(d => d.status === DeviceStatus.OFFLINE).length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Devices</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            Manage and monitor all your tracking devices
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{devices.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Squares2X2Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Online</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.online}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Moving</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{statusCounts.moving}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <MapPinIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Offline</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{statusCounts.offline}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, IMEI, plate, or driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="w-40"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
              className="w-40"
            />
            <div className="flex border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border'
                )}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'table' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border'
                )}
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Device list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-dark-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredDevices.length === 0 ? (
        <Card className="text-center py-12">
          <Squares2X2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
            No devices found
          </h3>
          <p className="text-gray-500 dark:text-dark-muted mb-4">
            {search || statusFilter || typeFilter 
              ? 'Try adjusting your filters'
              : 'Get started by adding your first device'}
          </p>
          {!search && !statusFilter && !typeFilter && (
            <Button onClick={() => setShowAddModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Device
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isSelected={selectedDevice?.id === device.id}
              onClick={() => selectDevice(device)}
            />
          ))}
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                    Speed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                    Last Update
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredDevices.map((device) => (
                  <tr 
                    key={device.id} 
                    className="hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-dark-border flex items-center justify-center">
                          <MapPinIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                            {device.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-dark-muted">
                            {device.attributes?.licensePlate || device.imei}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          device.status === DeviceStatus.MOVING ? 'success' :
                          device.status === DeviceStatus.IDLE ? 'warning' :
                          device.status === DeviceStatus.OFFLINE ? 'default' : 'info'
                        }
                        dot
                      >
                        {device.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                      {device.lastPosition ? formatSpeed(device.lastPosition.speed) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-muted">
                      {device.lastPosition ? formatRelativeTime(device.lastPosition.deviceTime) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                      {device.attributes?.driverName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/tracking?device=${device.id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Device Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Device"
        description="Register a new GPS tracking device"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Device Name" placeholder="e.g., Truck 01" />
            <Input label="IMEI" placeholder="15-digit IMEI number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Device Type"
              options={[
                { value: DeviceType.VEHICLE, label: 'Vehicle' },
                { value: DeviceType.PERSONAL, label: 'Personal' },
                { value: DeviceType.ASSET, label: 'Asset' },
              ]}
              placeholder="Select type"
            />
            <Input label="Phone Number" placeholder="+1234567890" />
          </div>
          <Input label="License Plate" placeholder="e.g., ABC-1234" />
          <Input label="Model" placeholder="e.g., FMC920" />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Device
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
