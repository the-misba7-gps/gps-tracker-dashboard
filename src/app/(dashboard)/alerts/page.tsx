'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, Badge } from '@/components/ui';
import { alertsApi } from '@/services/api';
import { useAlertStore } from '@/store';
import { Alert, AlertType, AlertSeverity } from '@/types';
import { formatRelativeTime, formatSpeed, cn } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  FunnelIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline';

const severityConfig = {
  [AlertSeverity.CRITICAL]: {
    icon: XCircleIcon,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    badge: 'danger' as const,
  },
  [AlertSeverity.WARNING]: {
    icon: ExclamationTriangleIcon,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    badge: 'warning' as const,
  },
  [AlertSeverity.INFO]: {
    icon: InformationCircleIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    badge: 'info' as const,
  },
};

export default function AlertsPage() {
  const { alerts, setAlerts, markAsRead, markAllAsRead, unreadCount } = useAlertStore();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await alertsApi.getAll();
        setAlerts(data);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAlerts();
  }, [setAlerts]);

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.deviceName.toLowerCase().includes(searchLower) ||
        a.message.toLowerCase().includes(searchLower)
      );
    }

    if (severityFilter) {
      filtered = filtered.filter(a => a.severity === severityFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    if (readFilter === 'unread') {
      filtered = filtered.filter(a => !a.isRead);
    } else if (readFilter === 'read') {
      filtered = filtered.filter(a => a.isRead);
    }

    return filtered;
  }, [alerts, search, severityFilter, typeFilter, readFilter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertsApi.markAsRead(id);
      markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertsApi.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const severityOptions = [
    { value: '', label: 'All Severities' },
    { value: AlertSeverity.CRITICAL, label: 'Critical' },
    { value: AlertSeverity.WARNING, label: 'Warning' },
    { value: AlertSeverity.INFO, label: 'Info' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: AlertType.OVERSPEED, label: 'Overspeed' },
    { value: AlertType.GEOFENCE_ENTER, label: 'Geofence Enter' },
    { value: AlertType.GEOFENCE_EXIT, label: 'Geofence Exit' },
    { value: AlertType.LOW_BATTERY, label: 'Low Battery' },
    { value: AlertType.POWER_CUT, label: 'Power Cut' },
    { value: AlertType.SOS, label: 'SOS' },
    { value: AlertType.HARSH_BRAKING, label: 'Harsh Braking' },
    { value: AlertType.HARSH_ACCELERATION, label: 'Harsh Acceleration' },
  ];

  const readOptions = [
    { value: '', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
  ];

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
    warning: alerts.filter(a => a.severity === AlertSeverity.WARNING).length,
    info: alerts.filter(a => a.severity === AlertSeverity.INFO).length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Alerts</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckIcon className="h-5 w-5 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{stats.total}</p>
            </div>
            <BellIcon className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Info</p>
              <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
            </div>
            <InformationCircleIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={severityOptions}
              className="w-40"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
              className="w-48"
            />
            <Select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              options={readOptions}
              className="w-32"
            />
          </div>
        </div>
      </Card>

      {/* Alerts list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-dark-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card className="text-center py-12">
          <BellSlashIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
            No alerts found
          </h3>
          <p className="text-gray-500 dark:text-dark-muted">
            {search || severityFilter || typeFilter 
              ? 'Try adjusting your filters'
              : 'No alerts to display'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <Card
                key={alert.id}
                className={cn(
                  'transition-all',
                  !alert.isRead && 'border-l-4 border-l-primary-500'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2 rounded-lg', config.bg)}>
                    <Icon className={cn('h-6 w-6', config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                          {alert.deviceName}
                        </h3>
                        <Badge variant={config.badge} size="sm">
                          {alert.severity}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {alert.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-dark-muted whitespace-nowrap">
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-dark-muted mt-1">
                      {alert.message}
                    </p>

                    {alert.type === AlertType.OVERSPEED && alert.speed && (
                      <p className="text-sm text-red-600 mt-2">
                        Speed: {formatSpeed(alert.speed)} (Limit: {formatSpeed(alert.speedLimit || 0)})
                      </p>
                    )}
                  </div>

                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                      title="Mark as read"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
