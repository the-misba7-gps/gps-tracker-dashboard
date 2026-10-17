// Traccar adapter: talks to a Traccar server (REST + WebSocket) and converts its data into the
// dashboard's own types, so pages keep working unchanged. Requests go through the Next.js proxy
// (/api/* -> TRACCAR_URL/api/*), so the Traccar session cookie stays on the dashboard's origin.

import axios from 'axios';
import {
  Alert,
  AlertSeverity,
  AlertType,
  DashboardStats,
  Device,
  DeviceStatus,
  DeviceType,
  Geofence,
  GeofenceArea,
  Group,
  Position,
  Priority,
  Ride,
  RideStatus,
  User,
} from '@/types';

// ============ Traccar models (subset of openapi.yaml) ============

type Attributes = Record<string, unknown>;

export interface TraccarUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  readonly: boolean;
  administrator: boolean;
  deviceReadonly?: boolean;
  userLimit?: number;
  attributes: Attributes;
}

export interface TraccarDevice {
  id: number;
  name: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'unknown';
  disabled: boolean;
  lastUpdate?: string;
  positionId?: number;
  groupId?: number;
  phone?: string;
  model?: string;
  contact?: string;
  category?: string;
  attributes: Attributes;
}

export interface TraccarPosition {
  id: number;
  deviceId: number;
  protocol?: string;
  serverTime: string;
  deviceTime: string;
  fixTime: string;
  outdated?: boolean;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address?: string;
  accuracy?: number;
  attributes: Attributes;
}

export interface TraccarEvent {
  id: number;
  type: string;
  eventTime: string;
  deviceId: number;
  positionId?: number;
  geofenceId?: number;
  maintenanceId?: number;
  attributes: Attributes;
}

export interface TraccarGeofence {
  id: number;
  name: string;
  description?: string;
  area: string;
  calendarId?: number;
  attributes: Attributes;
}

export interface TraccarGroup {
  id: number;
  name: string;
  groupId?: number;
  attributes: Attributes;
}

export interface TraccarTrip {
  deviceId: number;
  deviceName: string;
  maxSpeed: number;
  averageSpeed: number;
  distance: number;
  spentFuel?: number;
  duration: number;
  startTime: string;
  startAddress?: string;
  startLat: number;
  startLon: number;
  endTime: string;
  endAddress?: string;
  endLat: number;
  endLon: number;
  driverName?: string;
}

export interface TraccarSummary {
  deviceId: number;
  deviceName: string;
  maxSpeed: number;
  averageSpeed: number;
  distance: number;
  engineHours: number;
}

// ============ HTTP client ============

export const traccar = axios.create({
  baseURL: '',
  timeout: 60000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

const json = { headers: { 'Content-Type': 'application/json' } };

// Traccar report endpoints take repeated query keys (deviceId=1&deviceId=2)
const query = (params: Record<string, string | number | (string | number)[] | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => search.append(key, String(item)));
  });
  return search.toString();
};

const iso = (date: Date) => date.toISOString();
const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// ============ Users and roles ============

export type Role = User['role'];

// Dashboard roles on top of Traccar permissions. Traccar already limits every request to the
// user's own devices and groups; the role only decides which screens are shown.
//   administrator            -> ADMIN
//   attributes['fink.role']  -> explicit role (FLEET_MANAGER, OWNER, DRIVER, VIEWER)
//   manager (userLimit != 0) -> FLEET_MANAGER
//   read-only                -> VIEWER
//   anyone else              -> OWNER
export const roleOf = (user: TraccarUser): Role => {
  if (user.administrator) return 'ADMIN';
  const explicit = String(user.attributes?.['fink.role'] || '').toUpperCase();
  if (['FLEET_MANAGER', 'OWNER', 'DRIVER', 'VIEWER'].includes(explicit)) return explicit as Role;
  if ((user.userLimit || 0) !== 0) return 'FLEET_MANAGER';
  if (user.readonly) return 'VIEWER';
  return 'OWNER';
};

const splitName = (name: string) => {
  const parts = (name || '').trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
};

export const toUser = (user: TraccarUser, assignedDeviceId?: string): User => ({
  id: String(user.id),
  email: user.email,
  ...splitName(user.name),
  phone: user.phone,
  role: roleOf(user),
  assignedDeviceId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const session = {
  login: async (email: string, password: string): Promise<TraccarUser> => {
    const response = await traccar.post('/api/session', new URLSearchParams({ email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
  current: async (): Promise<TraccarUser> => (await traccar.get('/api/session')).data,
  logout: async () => {
    await traccar.delete('/api/session');
  },
};

// A driver sees one vehicle: the first device the server gives them
export const currentUser = async (): Promise<User> => {
  const user = await session.current();
  const role = roleOf(user);
  let assignedDeviceId: string | undefined;
  if (role === 'DRIVER') {
    const devices: TraccarDevice[] = (await traccar.get('/api/devices')).data;
    assignedDeviceId = devices[0] ? String(devices[0].id) : undefined;
  }
  return toUser(user, assignedDeviceId);
};

// ============ Devices and positions ============

const categoryToType = (category?: string): DeviceType => {
  switch (category) {
    case 'person':
      return DeviceType.PERSONAL;
    case 'animal':
      return DeviceType.ANIMAL;
    case 'trailer':
    case 'crane':
      return DeviceType.CONTAINER;
    case 'default':
    case undefined:
    case null:
      return DeviceType.VEHICLE;
    default:
      return ['boat', 'ship', 'plane', 'helicopter'].includes(category)
        ? DeviceType.ASSET
        : DeviceType.VEHICLE;
  }
};

const typeToCategory = (type?: DeviceType) => {
  switch (type) {
    case DeviceType.PERSONAL:
      return 'person';
    case DeviceType.ANIMAL:
      return 'animal';
    case DeviceType.CONTAINER:
      return 'trailer';
    case DeviceType.ASSET:
      return 'default';
    default:
      return 'car';
  }
};

const priorityOf = (position: TraccarPosition): Priority => {
  const alarm = String(position.attributes?.alarm || '');
  if (alarm.includes('sos')) return Priority.PANIC;
  return alarm ? Priority.HIGH : Priority.LOW;
};

export const toPosition = (position: TraccarPosition, imei = ''): Position => {
  const { sat, ...rest } = position.attributes || {};
  return {
    id: String(position.id),
    imei,
    deviceId: String(position.deviceId),
    protocol: position.protocol,
    serverTime: position.serverTime,
    deviceTime: position.deviceTime,
    fixTime: position.fixTime,
    valid: position.valid,
    latitude: position.latitude,
    longitude: position.longitude,
    altitude: position.altitude,
    speed: position.speed,
    course: position.course,
    address: position.address,
    accuracy: position.accuracy,
    priority: priorityOf(position),
    attributes: { ...rest, satellites: sat as number | undefined },
  };
};

// One state per vehicle, the same rules as the Fink portal
export const statusOf = (online: boolean, position?: Position | TraccarPosition): DeviceStatus => {
  if (!online) return DeviceStatus.OFFLINE;
  if (!position) return DeviceStatus.ONLINE;
  if (!position.valid) return DeviceStatus.NO_GPS;
  if (position.attributes?.motion || position.speed > 1) return DeviceStatus.MOVING;
  if (position.attributes?.ignition) return DeviceStatus.IDLE;
  return DeviceStatus.STOPPED;
};

const deviceAttributes = (device: TraccarDevice) => {
  const a = device.attributes || {};
  return {
    licensePlate: (a.licensePlate as string) || undefined,
    make: (a.make as string) || undefined,
    model: (a.vehicleModel as string) || device.model,
    year: a.year ? Number(a.year) : undefined,
    color: (a.color as string) || undefined,
    vin: (a.vin as string) || undefined,
    driverName: device.contact || undefined,
    fuelCapacity: a.fuelCapacity ? Number(a.fuelCapacity) : undefined,
  };
};

export const toDevice = (
  device: TraccarDevice,
  position?: TraccarPosition,
  groups: Map<number, string> = new Map(),
): Device => {
  const lastPosition = position ? toPosition(position, device.uniqueId) : undefined;
  return {
    id: String(device.id),
    imei: device.uniqueId,
    name: device.name,
    type: categoryToType(device.category),
    model: device.model,
    phone: device.phone,
    groupId: device.groupId ? String(device.groupId) : undefined,
    groupName: device.groupId ? groups.get(device.groupId) : undefined,
    status: statusOf(device.status === 'online', lastPosition),
    lastPosition,
    attributes: deviceAttributes(device),
    createdAt: device.lastUpdate || new Date().toISOString(),
    updatedAt: device.lastUpdate || new Date().toISOString(),
  };
};

export const fromDevice = (device: Partial<Device>, existing?: TraccarDevice): Partial<TraccarDevice> => {
  const a = device.attributes || {};
  return {
    ...existing,
    name: device.name ?? existing?.name,
    uniqueId: device.imei ?? existing?.uniqueId,
    category: device.type ? typeToCategory(device.type) : existing?.category,
    model: device.model ?? existing?.model,
    phone: device.phone ?? existing?.phone,
    groupId: device.groupId !== undefined ? Number(device.groupId) || 0 : existing?.groupId,
    contact: a.driverName ?? existing?.contact,
    attributes: {
      ...(existing?.attributes || {}),
      ...(a.licensePlate !== undefined && { licensePlate: a.licensePlate }),
      ...(a.make !== undefined && { make: a.make }),
      ...(a.year !== undefined && { year: a.year }),
      ...(a.color !== undefined && { color: a.color }),
      ...(a.vin !== undefined && { vin: a.vin }),
      ...(a.fuelCapacity !== undefined && { fuelCapacity: a.fuelCapacity }),
    },
  };
};

export const fetchDevicesRaw = async (): Promise<TraccarDevice[]> =>
  (await traccar.get('/api/devices')).data;

export const fetchLatestPositions = async (): Promise<TraccarPosition[]> =>
  (await traccar.get('/api/positions')).data;

export const fetchGroupsRaw = async (): Promise<TraccarGroup[]> =>
  (await traccar.get('/api/groups')).data;

export const fetchDevices = async (): Promise<Device[]> => {
  const [devices, positions, groups] = await Promise.all([
    fetchDevicesRaw(),
    fetchLatestPositions(),
    fetchGroupsRaw().catch(() => [] as TraccarGroup[]),
  ]);
  const byDevice = new Map(positions.map((p) => [p.deviceId, p]));
  const groupNames = new Map(groups.map((g) => [g.id, g.name]));
  return devices
    .filter((d) => !d.disabled)
    .map((d) => toDevice(d, byDevice.get(d.id), groupNames));
};

export const fetchPositions = async (deviceId: string, from?: string, to?: string) => {
  const response = await traccar.get(
    `/api/positions?${query({
      deviceId,
      from: from || iso(daysAgo(1)),
      to: to || iso(new Date()),
    })}`,
  );
  return (response.data as TraccarPosition[]).map((p) => toPosition(p));
};

// ============ Trips (Traccar trips report) ============

// Traccar trips have no id: the dashboard id encodes the device and the time window
export const tripId = (trip: TraccarTrip) =>
  `${trip.deviceId}_${Date.parse(trip.startTime)}_${Date.parse(trip.endTime)}`;

export const parseTripId = (id: string) => {
  const [deviceId, start, end] = id.split('_');
  return { deviceId, start: Number(start), end: Number(end) };
};

const place = (address: string | undefined, latitude: number, longitude: number) => ({
  name: address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
  latitude,
  longitude,
});

export const toRide = (trip: TraccarTrip, imei = ''): Ride => ({
  id: tripId(trip),
  imei,
  deviceId: String(trip.deviceId),
  deviceName: trip.deviceName,
  distance: trip.distance,
  startStation: place(trip.startAddress, trip.startLat, trip.startLon),
  endStation: place(trip.endAddress, trip.endLat, trip.endLon),
  startTime: trip.startTime,
  endTime: trip.endTime,
  status: RideStatus.ENDED,
  maxSpeed: trip.maxSpeed,
  avgSpeed: trip.averageSpeed,
  duration: Math.round(trip.duration / 1000),
});

export const fetchTrips = async (
  deviceIds: string[],
  from: Date,
  to: Date,
): Promise<TraccarTrip[]> => {
  if (!deviceIds.length) return [];
  const response = await traccar.get(
    `/api/reports/trips?${query({ deviceId: deviceIds, from: iso(from), to: iso(to) })}`,
  );
  return response.data;
};

export const fetchSummary = async (
  deviceIds: string[],
  from: Date,
  to: Date,
): Promise<TraccarSummary[]> => {
  if (!deviceIds.length) return [];
  const response = await traccar.get(
    `/api/reports/summary?${query({ deviceId: deviceIds, from: iso(from), to: iso(to) })}`,
  );
  return response.data;
};

export const fetchRide = async (id: string): Promise<Ride> => {
  const { deviceId, start, end } = parseTripId(id);
  const from = new Date(start - 1000);
  const to = new Date(end + 1000);
  const [trips, positions] = await Promise.all([
    fetchTrips([deviceId], from, to),
    fetchPositions(deviceId, iso(new Date(start)), iso(new Date(end))),
  ]);
  const trip = trips.find((t) => Date.parse(t.startTime) === start) || trips[0];
  if (!trip) throw new Error('Trip not found');
  return { ...toRide(trip), locations: positions };
};

// ============ Geofences (Traccar stores WKT text, latitude first) ============

const numbers = (text: string) => text.trim().split(/[\s,]+/).map(Number);

export const wktToArea = (area: string): { type: Geofence['type']; area: GeofenceArea } => {
  const upper = area.trim().toUpperCase();
  if (upper.startsWith('CIRCLE')) {
    const [lat, lng, radius] = numbers(area.replace(/CIRCLE|\(|\)/gi, ''));
    return { type: 'CIRCLE', area: { center: { lat, lng }, radius } };
  }
  const body = area.replace(/^[A-Z]+\s*/i, '').replace(/[()]/g, '');
  const coordinates = body
    .split(',')
    .map((pair) => pair.trim().split(/\s+/).map(Number))
    .filter((pair) => pair.length === 2 && pair.every((n) => !Number.isNaN(n)))
    .map(([lat, lng]) => ({ lat, lng }));
  return { type: 'POLYGON', area: { coordinates } };
};

export const areaToWkt = (type: Geofence['type'], area: GeofenceArea): string => {
  if (type === 'CIRCLE' && area.center) {
    return `CIRCLE (${area.center.lat} ${area.center.lng}, ${area.radius || 100})`;
  }
  const points = [...(area.coordinates || [])];
  if (points.length && (points[0].lat !== points[points.length - 1].lat || points[0].lng !== points[points.length - 1].lng)) {
    points.push(points[0]);
  }
  return `POLYGON((${points.map((p) => `${p.lat} ${p.lng}`).join(', ')}))`;
};

export const toGeofence = (geofence: TraccarGeofence): Geofence => ({
  id: String(geofence.id),
  name: geofence.name,
  description: geofence.description,
  ...wktToArea(geofence.area),
  color: (geofence.attributes?.color as string) || undefined,
  isActive: geofence.attributes?.active !== false,
  createdAt: new Date().toISOString(),
});

export const fromGeofence = (
  geofence: Partial<Geofence>,
  existing?: TraccarGeofence,
): Partial<TraccarGeofence> => {
  const current = existing ? toGeofence(existing) : undefined;
  return {
    ...existing,
    name: geofence.name ?? existing?.name,
    description: geofence.description ?? existing?.description,
    area:
      geofence.area || geofence.type
        ? areaToWkt(geofence.type || current?.type || 'POLYGON', geofence.area || current!.area)
        : existing?.area,
    attributes: {
      ...(existing?.attributes || {}),
      ...(geofence.color !== undefined && { color: geofence.color }),
      ...(geofence.isActive !== undefined && { active: geofence.isActive }),
    },
  };
};

// ============ Groups ============

export const toGroup = (group: TraccarGroup): Group => ({
  id: String(group.id),
  name: group.name,
  description: (group.attributes?.description as string) || undefined,
  parentId: group.groupId ? String(group.groupId) : undefined,
  createdAt: new Date().toISOString(),
});

export const fromGroup = (group: Partial<Group>, existing?: TraccarGroup): Partial<TraccarGroup> => ({
  ...existing,
  name: group.name ?? existing?.name,
  groupId: group.parentId !== undefined ? Number(group.parentId) || 0 : existing?.groupId,
  attributes: {
    ...(existing?.attributes || {}),
    ...(group.description !== undefined && { description: group.description }),
  },
});

// ============ Alerts (Traccar events) ============

// Event types worth showing as alerts. Movement, online/offline and engine on/off events are
// left out: trackers send them all day long and they would drown the real alarms.
export const ALERT_EVENT_TYPES = ['alarm', 'deviceOverspeed', 'geofenceEnter', 'geofenceExit'];

const ALARMS: Record<string, AlertType> = {
  sos: AlertType.SOS,
  lowBattery: AlertType.LOW_BATTERY,
  lowPower: AlertType.LOW_BATTERY,
  powerCut: AlertType.POWER_CUT,
  powerOff: AlertType.POWER_CUT,
  tampering: AlertType.TAMPERING,
  removing: AlertType.TAMPERING,
  jamming: AlertType.TAMPERING,
  tow: AlertType.TOW,
  accident: AlertType.ACCIDENT,
  fall: AlertType.ACCIDENT,
  hardAcceleration: AlertType.HARSH_ACCELERATION,
  hardBraking: AlertType.HARSH_BRAKING,
  hardCornering: AlertType.HARSH_CORNERING,
  idle: AlertType.IDLE,
};

const alertTypeOf = (event: TraccarEvent): AlertType => {
  switch (event.type) {
    case 'deviceOverspeed':
      return AlertType.OVERSPEED;
    case 'geofenceEnter':
      return AlertType.GEOFENCE_ENTER;
    case 'geofenceExit':
      return AlertType.GEOFENCE_EXIT;
    case 'ignitionOn':
      return AlertType.IGNITION_ON;
    case 'ignitionOff':
      return AlertType.IGNITION_OFF;
    default: {
      const alarm = String(event.attributes?.alarm || '').split(',')[0];
      return ALARMS[alarm] || AlertType.TAMPERING;
    }
  }
};

const SEVERITY: Partial<Record<AlertType, AlertSeverity>> = {
  [AlertType.SOS]: AlertSeverity.CRITICAL,
  [AlertType.ACCIDENT]: AlertSeverity.CRITICAL,
  [AlertType.POWER_CUT]: AlertSeverity.CRITICAL,
  [AlertType.TOW]: AlertSeverity.CRITICAL,
  [AlertType.TAMPERING]: AlertSeverity.CRITICAL,
  [AlertType.IGNITION_ON]: AlertSeverity.INFO,
  [AlertType.IGNITION_OFF]: AlertSeverity.INFO,
};

const knotsToKmh = (knots: number) => Math.round(knots * 1.852);

const messageOf = (type: AlertType, event: TraccarEvent, deviceName: string, geofenceName?: string) => {
  const speed = Number(event.attributes?.speed || 0);
  const limit = Number(event.attributes?.speedLimit || 0);
  switch (type) {
    case AlertType.OVERSPEED:
      return `${deviceName} drove at ${knotsToKmh(speed)} km/h${limit ? ` (limit ${knotsToKmh(limit)} km/h)` : ''}`;
    case AlertType.GEOFENCE_ENTER:
      return `${deviceName} entered ${geofenceName || 'a geofence'}`;
    case AlertType.GEOFENCE_EXIT:
      return `${deviceName} left ${geofenceName || 'a geofence'}`;
    case AlertType.IGNITION_ON:
      return `${deviceName}: engine started`;
    case AlertType.IGNITION_OFF:
      return `${deviceName}: engine stopped`;
    default:
      return `${deviceName}: ${String(event.attributes?.alarm || 'alarm')} alarm`;
  }
};

// Traccar has no read/unread state: it is kept in this browser
const READ_KEY = 'traccar-alerts-read';
interface ReadState {
  allBefore: number;
  ids: string[];
}
const readState = (): ReadState => {
  if (typeof window === 'undefined') return { allBefore: 0, ids: [] };
  try {
    return { allBefore: 0, ids: [], ...JSON.parse(localStorage.getItem(READ_KEY) || '{}') };
  } catch {
    return { allBefore: 0, ids: [] };
  }
};
const saveReadState = (state: ReadState) => {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify({ ...state, ids: state.ids.slice(-500) }));
  } catch {
    // storage unavailable: read state is not kept
  }
};
export const markRead = (id: string) => {
  const state = readState();
  if (!state.ids.includes(id)) saveReadState({ ...state, ids: [...state.ids, id] });
};
export const markAllRead = () => saveReadState({ allBefore: Date.now(), ids: [] });

export const toAlert = (
  event: TraccarEvent,
  devices: Map<number, { name: string }>,
  geofences: Map<number, string>,
): Alert => {
  const type = alertTypeOf(event);
  const deviceName = devices.get(event.deviceId)?.name || `Device ${event.deviceId}`;
  const geofenceName = event.geofenceId ? geofences.get(event.geofenceId) : undefined;
  const state = readState();
  const id = String(event.id);
  return {
    id,
    deviceId: String(event.deviceId),
    deviceName,
    type,
    severity: SEVERITY[type] || AlertSeverity.WARNING,
    message: messageOf(type, event, deviceName, geofenceName),
    geofenceId: event.geofenceId ? String(event.geofenceId) : undefined,
    geofenceName,
    speed: event.attributes?.speed ? Number(event.attributes.speed) : undefined,
    speedLimit: event.attributes?.speedLimit ? Number(event.attributes.speedLimit) : undefined,
    isRead: Date.parse(event.eventTime) <= state.allBefore || state.ids.includes(id),
    createdAt: event.eventTime,
  };
};

// Device and geofence names used to describe events
let lookupCache: { devices: Map<number, { name: string }>; geofences: Map<number, string> } | null = null;
export const lookups = async (refresh = false) => {
  if (!lookupCache || refresh) {
    const [devices, geofences] = await Promise.all([
      fetchDevicesRaw(),
      traccar.get('/api/geofences').then((r) => r.data as TraccarGeofence[]).catch(() => []),
    ]);
    lookupCache = {
      devices: new Map(devices.map((d) => [d.id, { name: d.name }])),
      geofences: new Map(geofences.map((g) => [g.id, g.name])),
    };
  }
  return lookupCache;
};

export const fetchAlerts = async (from: Date, to: Date, deviceId?: string): Promise<Alert[]> => {
  const names = await lookups(true);
  const deviceIds = deviceId ? [deviceId] : [...names.devices.keys()].map(String);
  if (!deviceIds.length) return [];
  const response = await traccar.get(
    `/api/reports/events?${query({
      deviceId: deviceIds,
      from: iso(from),
      to: iso(to),
      type: ALERT_EVENT_TYPES,
    })}`,
  );
  return (response.data as TraccarEvent[])
    .map((event) => toAlert(event, names.devices, names.geofences))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};

// ============ Dashboard numbers ============

export const fetchStats = async (): Promise<DashboardStats> => {
  const devices = await fetchDevices();
  const ids = devices.map((d) => d.id);
  // Today's distance adds up today's trips: the daily summary subtracts odometer readings,
  // which goes wrong (even negative) when a tracker restarts and resets its odometer
  const [trips, alerts] = await Promise.all([
    fetchTrips(ids, startOfToday(), new Date()).catch(() => [] as TraccarTrip[]),
    ids.length ? fetchAlerts(startOfToday(), new Date()).catch(() => [] as Alert[]) : [],
  ]);
  const count = (...statuses: DeviceStatus[]) => devices.filter((d) => statuses.includes(d.status)).length;
  return {
    totalDevices: devices.length,
    onlineDevices: devices.length - count(DeviceStatus.OFFLINE),
    movingDevices: count(DeviceStatus.MOVING),
    idleDevices: count(DeviceStatus.IDLE, DeviceStatus.STOPPED),
    offlineDevices: count(DeviceStatus.OFFLINE),
    totalDistance:
      Math.round(trips.reduce((sum, trip) => sum + Math.max(0, trip.distance || 0), 0) / 100) / 10,
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length,
  };
};

export const defaultRange = { from: () => daysAgo(7), to: () => new Date() };

// ============ Live updates (one shared WebSocket) ============

interface SocketMessage {
  devices?: TraccarDevice[];
  positions?: TraccarPosition[];
  events?: TraccarEvent[];
}

type Listener = (message: SocketMessage) => void;

const listeners = new Set<Listener>();
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const socketUrl = () => {
  if (process.env.NEXT_PUBLIC_TRACCAR_WS_URL) return process.env.NEXT_PUBLIC_TRACCAR_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/socket`;
};

const connect = () => {
  if (socket || typeof window === 'undefined') return;
  const ws = new WebSocket(socketUrl());
  socket = ws;
  ws.onmessage = (message) => {
    const data: SocketMessage = JSON.parse(message.data);
    listeners.forEach((listener) => listener(data));
  };
  ws.onclose = () => {
    if (socket === ws) socket = null;
    // Reconnect while someone is listening (server restart, network change)
    if (listeners.size && !reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, 5000);
    }
  };
};

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  connect();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      socket?.close();
      socket = null;
    }
  };
};

export const disconnect = () => {
  listeners.clear();
  socket?.close();
  socket = null;
};
