import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DeviceStatus, AlertSeverity, AlertType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Speed conversion utilities (compatible with existing backend)
export function knotsToKph(knots: number): number {
  return knots * 1.852;
}

export function knotsToMph(knots: number): number {
  return knots * 1.15078;
}

export function kphToKnots(kph: number): number {
  return kph / 1.852;
}

export function metersToKm(meters: number): number {
  return meters / 1000;
}

export function metersToMiles(meters: number): number {
  return meters / 1609.344;
}

// Duration formatting
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// Distance formatting
export function formatDistance(meters: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    return `${metersToMiles(meters).toFixed(2)} mi`;
  }
  return `${metersToKm(meters).toFixed(2)} km`;
}

// Speed formatting
export function formatSpeed(knots: number, unit: 'kph' | 'mph' = 'kph'): string {
  if (unit === 'mph') {
    return `${knotsToMph(knots).toFixed(0)} mph`;
  }
  return `${knotsToKph(knots).toFixed(0)} km/h`;
}

// Date formatting
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString();
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// Status color utilities
export function getStatusColor(status: DeviceStatus): string {
  switch (status) {
    case DeviceStatus.ONLINE:
    case DeviceStatus.MOVING:
      return 'text-green-500';
    case DeviceStatus.IDLE:
    case DeviceStatus.STOPPED:
      return 'text-yellow-500';
    case DeviceStatus.OFFLINE:
      return 'text-gray-500';
    case DeviceStatus.NO_GPS:
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
}

export function getStatusBgColor(status: DeviceStatus): string {
  switch (status) {
    case DeviceStatus.ONLINE:
    case DeviceStatus.MOVING:
      return 'bg-green-500';
    case DeviceStatus.IDLE:
    case DeviceStatus.STOPPED:
      return 'bg-yellow-500';
    case DeviceStatus.OFFLINE:
      return 'bg-gray-500';
    case DeviceStatus.NO_GPS:
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
}

export function getAlertSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return 'text-red-500';
    case AlertSeverity.WARNING:
      return 'text-yellow-500';
    case AlertSeverity.INFO:
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}

export function getAlertTypeIcon(type: AlertType): string {
  switch (type) {
    case AlertType.OVERSPEED:
      return 'speed';
    case AlertType.GEOFENCE_ENTER:
    case AlertType.GEOFENCE_EXIT:
      return 'map-pin';
    case AlertType.LOW_BATTERY:
      return 'battery-low';
    case AlertType.POWER_CUT:
      return 'power';
    case AlertType.SOS:
      return 'alert-triangle';
    case AlertType.ACCIDENT:
      return 'car-crash';
    default:
      return 'bell';
  }
}

// Generate random ID (for demo purposes)
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

// Calculate bearing between two coordinates
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);

  return ((theta * 180) / Math.PI + 360) % 360;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
