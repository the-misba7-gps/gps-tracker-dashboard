'use client';

import { Device, DeviceStatus } from '@/types';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { formatSpeed, formatRelativeTime, cn } from '@/lib/utils';
import { 
  TruckIcon, 
  SignalIcon, 
  MapPinIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface DeviceCardProps {
  device: Device;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const statusVariants: Record<DeviceStatus, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  [DeviceStatus.ONLINE]: 'success',
  [DeviceStatus.MOVING]: 'success',
  [DeviceStatus.IDLE]: 'warning',
  [DeviceStatus.STOPPED]: 'warning',
  [DeviceStatus.OFFLINE]: 'default',
  [DeviceStatus.NO_GPS]: 'danger',
};

export function DeviceCard({ device, isSelected, onClick, compact = false }: DeviceCardProps) {
  const hasPosition = !!device.lastPosition;
  const speed = device.lastPosition?.speed || 0;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center p-3 rounded-lg cursor-pointer transition-all',
          'hover:bg-gray-50 dark:hover:bg-dark-border',
          isSelected && 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
        )}
      >
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full mr-3',
          device.status === DeviceStatus.MOVING ? 'bg-green-100 dark:bg-green-900/30' :
          device.status === DeviceStatus.IDLE ? 'bg-yellow-100 dark:bg-yellow-900/30' :
          device.status === DeviceStatus.OFFLINE ? 'bg-gray-100 dark:bg-gray-800' :
          'bg-blue-100 dark:bg-blue-900/30'
        )}>
          <TruckIcon className={cn(
            'h-5 w-5',
            device.status === DeviceStatus.MOVING ? 'text-green-600 dark:text-green-400' :
            device.status === DeviceStatus.IDLE ? 'text-yellow-600 dark:text-yellow-400' :
            device.status === DeviceStatus.OFFLINE ? 'text-gray-500' :
            'text-blue-600 dark:text-blue-400'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
              {device.name}
            </h4>
            <Badge variant={statusVariants[device.status]} size="sm">
              {device.status}
            </Badge>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-dark-muted">
            {device.attributes?.licensePlate && (
              <span className="mr-3">{device.attributes.licensePlate}</span>
            )}
            {hasPosition && (
              <span>{formatSpeed(speed)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary-500'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-lg mr-4',
            device.status === DeviceStatus.MOVING ? 'bg-green-100 dark:bg-green-900/30' :
            device.status === DeviceStatus.IDLE ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            device.status === DeviceStatus.OFFLINE ? 'bg-gray-100 dark:bg-gray-800' :
            'bg-blue-100 dark:bg-blue-900/30'
          )}>
            <TruckIcon className={cn(
              'h-6 w-6',
              device.status === DeviceStatus.MOVING ? 'text-green-600 dark:text-green-400' :
              device.status === DeviceStatus.IDLE ? 'text-yellow-600 dark:text-yellow-400' :
              device.status === DeviceStatus.OFFLINE ? 'text-gray-500' :
              'text-blue-600 dark:text-blue-400'
            )} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text">
              {device.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              {device.attributes?.licensePlate || device.imei}
            </p>
          </div>
        </div>
        <Badge variant={statusVariants[device.status]} dot>
          {device.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <SignalIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 dark:text-dark-muted">
            {formatSpeed(speed)}
          </span>
        </div>
        
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 dark:text-dark-muted">
            {hasPosition ? formatRelativeTime(device.lastPosition!.deviceTime) : 'N/A'}
          </span>
        </div>

        {device.groupName && (
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-dark-muted truncate">
              {device.groupName}
            </span>
          </div>
        )}

        {device.attributes?.driverName && (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-dark-muted truncate">
              {device.attributes.driverName}
            </span>
          </div>
        )}
      </div>

      {hasPosition && device.lastPosition?.attributes && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-muted">
            {device.lastPosition.attributes.fuel !== undefined && (
              <span>Fuel: {device.lastPosition.attributes.fuel.toFixed(0)}%</span>
            )}
            {device.lastPosition.attributes.battery !== undefined && (
              <span>Battery: {device.lastPosition.attributes.battery.toFixed(0)}%</span>
            )}
            {device.lastPosition.attributes.ignition !== undefined && (
              <span>Ignition: {device.lastPosition.attributes.ignition ? 'ON' : 'OFF'}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
