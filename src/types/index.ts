// Types compatible with existing microservices (gps-centre, location-app, school-bus)

// ============ Enums ============
export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  IDLE = 'IDLE',
  MOVING = 'MOVING',
  STOPPED = 'STOPPED',
  NO_GPS = 'NO_GPS',
}

export enum DeviceType {
  VEHICLE = 'VEHICLE',
  PERSONAL = 'PERSONAL',
  ASSET = 'ASSET',
  CONTAINER = 'CONTAINER',
  ANIMAL = 'ANIMAL',
}

export enum Priority {
  LOW = 'LOW',
  HIGH = 'HIGH',
  PANIC = 'PANIC',
}

export enum RideStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  ENDED = 'ENDED',
}

export enum AlertType {
  OVERSPEED = 'OVERSPEED',
  GEOFENCE_ENTER = 'GEOFENCE_ENTER',
  GEOFENCE_EXIT = 'GEOFENCE_EXIT',
  LOW_BATTERY = 'LOW_BATTERY',
  POWER_CUT = 'POWER_CUT',
  SOS = 'SOS',
  TAMPERING = 'TAMPERING',
  IDLE = 'IDLE',
  TOW = 'TOW',
  ACCIDENT = 'ACCIDENT',
  HARSH_ACCELERATION = 'HARSH_ACCELERATION',
  HARSH_BRAKING = 'HARSH_BRAKING',
  HARSH_CORNERING = 'HARSH_CORNERING',
  IGNITION_ON = 'IGNITION_ON',
  IGNITION_OFF = 'IGNITION_OFF',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

// ============ Core Types ============
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  groupId?: string;
  assignedDeviceId?: string; // For drivers - their assigned vehicle
  role: 'ADMIN' | 'FLEET_MANAGER' | 'DRIVER' | 'OWNER' | 'USER' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
}

export interface Device {
  id: string;
  imei: string;
  name: string;
  type: DeviceType;
  model?: string;
  phone?: string;
  groupId?: string;
  groupName?: string;
  status: DeviceStatus;
  lastPosition?: Position;
  attributes?: DeviceAttributes;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceAttributes {
  licensePlate?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  driverId?: string;
  driverName?: string;
  fuelCapacity?: number;
  icon?: string;
}

// Position type compatible with location-app protobuf
export interface Position {
  id: string;
  imei: string;
  deviceId?: string;
  groupId?: string;
  protocol?: string;
  serverTime: string;
  deviceTime: string;
  fixTime?: string;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number; // in knots
  course: number;
  address?: string;
  accuracy?: number;
  priority: Priority;
  attributes?: PositionAttributes;
}

export interface PositionAttributes {
  satellites?: number;
  hdop?: number;
  pdop?: number;
  ignition?: boolean;
  motion?: boolean;
  rssi?: number;
  battery?: number;
  batteryLevel?: number;
  power?: number;
  fuel?: number;
  fuelLevel?: number;
  odometer?: number;
  tripOdometer?: number;
  rpm?: number;
  throttle?: number;
  coolantTemp?: number;
  engineLoad?: number;
  alarm?: string;
  driverUniqueId?: string;
  door?: boolean;
  temp1?: number;
  temp2?: number;
  temp3?: number;
  temp4?: number;
  [key: string]: unknown;
}

// Ride type compatible with location-app protobuf
export interface Ride {
  id: string;
  imei: string;
  deviceId?: string;
  deviceName?: string;
  groupId?: string;
  distance?: number; // in meters
  startStation?: Station;
  endStation?: Station;
  startTime: string;
  endTime?: string;
  locations?: Position[];
  status: RideStatus;
  maxSpeed?: number;
  avgSpeed?: number;
  duration?: number; // in seconds
}

export interface Station {
  name: string;
  latitude: number;
  longitude: number;
}

// ============ Geofence Types ============
export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: 'CIRCLE' | 'POLYGON' | 'RECTANGLE';
  area: GeofenceArea;
  groupId?: string;
  deviceIds?: string[];
  color?: string;
  isActive: boolean;
  createdAt: string;
}

export interface GeofenceArea {
  // For circle
  center?: { lat: number; lng: number };
  radius?: number; // in meters
  // For polygon/rectangle
  coordinates?: Array<{ lat: number; lng: number }>;
}

// ============ Alert Types ============
export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  position?: Position;
  geofenceId?: string;
  geofenceName?: string;
  speed?: number;
  speedLimit?: number;
  isRead: boolean;
  createdAt: string;
}

// ============ Report Types ============
export interface TripReport {
  deviceId: string;
  deviceName: string;
  startTime: string;
  endTime: string;
  startAddress?: string;
  endAddress?: string;
  distance: number; // meters
  duration: number; // seconds
  maxSpeed: number;
  avgSpeed: number;
  fuelUsed?: number;
  startOdometer?: number;
  endOdometer?: number;
}

export interface SummaryReport {
  deviceId: string;
  deviceName: string;
  period: { start: string; end: string };
  totalDistance: number;
  totalDuration: number;
  totalTrips: number;
  maxSpeed: number;
  avgSpeed: number;
  totalFuelUsed?: number;
  engineHours?: number;
  idleTime?: number;
  alerts: { type: AlertType; count: number }[];
}

// ============ Dashboard Types ============
export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  movingDevices: number;
  idleDevices: number;
  offlineDevices: number;
  totalDistance: number; // today in km
  totalAlerts: number;
  criticalAlerts: number;
}

export interface DeviceMarker {
  device: Device;
  position: Position;
  isSelected?: boolean;
}

// ============ API Response Types ============
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  path?: string;
}

// ============ Filter Types ============
export interface DeviceFilter {
  search?: string;
  groupId?: string;
  status?: DeviceStatus;
  type?: DeviceType;
}

export interface RideFilter {
  deviceId?: string;
  groupId?: string;
  status?: RideStatus;
  startDate?: string;
  endDate?: string;
}

export interface AlertFilter {
  deviceId?: string;
  type?: AlertType;
  severity?: AlertSeverity;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}
