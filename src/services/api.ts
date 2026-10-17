import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Device,
  DeviceFilter,
  Position,
  Ride,
  RideFilter,
  Geofence,
  Alert,
  AlertFilter,
  Group,
  User,
  DashboardStats,
  PaginatedResponse,
  ApiError,
  DeviceStatus,
  AlertSeverity,
  RideStatus,
} from '@/types';
import {
  generateDemoDevices,
  generateDemoRides,
  generateDemoGeofences,
  generateDemoAlerts,
  generateDemoGroups,
  generateDemoUser,
  generateDashboardStats,
  simulatePositionUpdate,
} from './demoData';
import { useAuthStore } from '@/store';
import * as traccarApi from './traccar';

// Demo mode is enabled by default - set NEXT_PUBLIC_DEMO_MODE=false to disable
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Demo data cache
let demoDevices: Device[] | null = null;
let demoRides: Ride[] | null = null;
let demoAlerts: Alert[] | null = null;
let demoGeofences: Geofence[] | null = null;
let demoGroups: Group[] | null = null;

function getDemoDevices(): Device[] {
  if (!demoDevices) {
    demoDevices = generateDemoDevices(12);
  }
  return demoDevices;
}

function getDemoRides(): Ride[] {
  if (!demoRides) {
    demoRides = generateDemoRides(getDemoDevices(), 7);
  }
  return demoRides;
}

function getDemoAlerts(): Alert[] {
  if (!demoAlerts) {
    demoAlerts = generateDemoAlerts(getDemoDevices());
  }
  return demoAlerts;
}

function getDemoGeofences(): Geofence[] {
  if (!demoGeofences) {
    demoGeofences = generateDemoGeofences();
  }
  return demoGeofences;
}

function getDemoGroups(): Group[] {
  if (!demoGroups) {
    demoGroups = generateDemoGroups();
  }
  return demoGroups;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Get current user from auth store (for role-based filtering)
function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().user;
}

// Role-based data filtering
function filterDevicesByRole(devices: Device[]): Device[] {
  const user = getCurrentUser();
  if (!user) return devices;

  switch (user.role) {
    case 'ADMIN':
      return devices; // Full access
    case 'FLEET_MANAGER':
    case 'OWNER':
      // Filter by user's group
      return user.groupId 
        ? devices.filter(d => d.groupId === user.groupId)
        : devices;
    case 'DRIVER':
      // Only assigned device
      return user.assignedDeviceId
        ? devices.filter(d => d.id === user.assignedDeviceId)
        : [];
    default:
      return [];
  }
}

function filterRidesByRole(rides: Ride[], devices: Device[]): Ride[] {
  const user = getCurrentUser();
  if (!user) return rides;

  switch (user.role) {
    case 'ADMIN':
      return rides; // Full access
    case 'FLEET_MANAGER':
    case 'OWNER':
      // Filter by user's group devices
      const groupDeviceIds = devices
        .filter(d => d.groupId === user.groupId)
        .map(d => d.id);
      return rides.filter(r => groupDeviceIds.includes(r.deviceId || ''));
    case 'DRIVER':
      // Only assigned device trips
      return user.assignedDeviceId
        ? rides.filter(r => r.deviceId === user.assignedDeviceId)
        : [];
    default:
      return [];
  }
}

function filterAlertsByRole(alerts: Alert[], devices: Device[]): Alert[] {
  const user = getCurrentUser();
  if (!user) return alerts;

  switch (user.role) {
    case 'ADMIN':
      return alerts; // Full access
    case 'FLEET_MANAGER':
    case 'OWNER':
      // Filter by user's group devices
      const groupDeviceIds = devices
        .filter(d => d.groupId === user.groupId)
        .map(d => d.id);
      return alerts.filter(a => groupDeviceIds.includes(a.deviceId));
    case 'DRIVER':
      // Only assigned device alerts
      return user.assignedDeviceId
        ? alerts.filter(a => a.deviceId === user.assignedDeviceId)
        : [];
    default:
      return [];
  }
}

function filterGroupsByRole(groups: Group[]): Group[] {
  const user = getCurrentUser();
  if (!user) return groups;

  switch (user.role) {
    case 'ADMIN':
      return groups; // Full access
    case 'FLEET_MANAGER':
    case 'OWNER':
      // Only their group
      return user.groupId 
        ? groups.filter(g => g.id === user.groupId)
        : groups;
    default:
      return [];
  }
}

// Generate role-filtered dashboard stats
function generateFilteredDashboardStats(devices: Device[], alerts: Alert[]): DashboardStats {
  const filteredDevices = filterDevicesByRole(devices);
  const filteredAlerts = filterAlertsByRole(alerts, devices);
  
  const onlineDevices = filteredDevices.filter(d => d.status !== DeviceStatus.OFFLINE).length;
  const movingDevices = filteredDevices.filter(d => d.status === DeviceStatus.MOVING).length;
  const idleDevices = filteredDevices.filter(d => d.status === DeviceStatus.IDLE || d.status === DeviceStatus.STOPPED).length;
  const offlineDevices = filteredDevices.filter(d => d.status === DeviceStatus.OFFLINE).length;
  
  const todayAlerts = filteredAlerts.filter(a => {
    const alertDate = new Date(a.createdAt);
    const today = new Date();
    return alertDate.toDateString() === today.toDateString();
  });
  
  return {
    totalDevices: filteredDevices.length,
    onlineDevices,
    movingDevices,
    idleDevices,
    offlineDevices,
    totalDistance: Math.round((1500 + Math.random() * 3000) * (filteredDevices.length / 12)), // Scale by device count
    totalAlerts: todayAlerts.length,
    criticalAlerts: todayAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
  };
}

// ============ Traccar mode helpers ============
// The Traccar server already limits every request to the user's own devices and groups,
// so these only apply the filters chosen on screen.

function applyDeviceFilter(devices: Device[], filter?: DeviceFilter): Device[] {
  let result = devices;
  if (filter?.search) {
    const search = filter.search.toLowerCase();
    result = result.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.imei.toLowerCase().includes(search) ||
      d.attributes?.licensePlate?.toLowerCase().includes(search)
    );
  }
  if (filter?.status) result = result.filter(d => d.status === filter.status);
  if (filter?.groupId) result = result.filter(d => d.groupId === filter.groupId);
  if (filter?.type) result = result.filter(d => d.type === filter.type);
  return result;
}

const rangeOf = (startDate?: string, endDate?: string) => ({
  from: startDate ? new Date(startDate) : traccarApi.defaultRange.from(),
  to: endDate ? new Date(endDate) : traccarApi.defaultRange.to(),
});

async function fetchRides(filter?: RideFilter): Promise<Ride[]> {
  // Traccar reports only finished trips, so "in progress" filters return nothing
  if (filter?.status === RideStatus.IN_PROGRESS) return [];
  const devices = await traccarApi.fetchDevices();
  const deviceIds = devices
    .filter(d => !filter?.deviceId || d.id === filter.deviceId)
    .filter(d => !filter?.groupId || d.groupId === filter.groupId)
    .map(d => d.id);
  const { from, to } = rangeOf(filter?.startDate, filter?.endDate);
  const imeis = new Map(devices.map(d => [d.id, d.imei]));
  const trips = await traccarApi.fetchTrips(deviceIds, from, to);
  return trips
    .map(trip => traccarApi.toRide(trip, imeis.get(String(trip.deviceId))))
    .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime));
}

async function fetchAlertList(filter?: AlertFilter): Promise<Alert[]> {
  const { from, to } = rangeOf(filter?.startDate, filter?.endDate);
  let alerts = await traccarApi.fetchAlerts(from, to, filter?.deviceId);
  if (filter?.type) alerts = alerts.filter(a => a.type === filter.type);
  if (filter?.severity) alerts = alerts.filter(a => a.severity === filter.severity);
  if (filter?.isRead !== undefined) alerts = alerts.filter(a => a.isRead === filter.isRead);
  return alerts;
}

// ============ API Functions ============

// Auth
export const authApi = {
  getCurrentUser: async (): Promise<User> => {
    if (isDemoMode) {
      await delay(300);
      return generateDemoUser();
    }
    return traccarApi.currentUser();
  },

  logout: async (): Promise<void> => {
    if (isDemoMode) {
      localStorage.removeItem('access_token');
      return;
    }
    await traccarApi.session.logout();
    traccarApi.disconnect();
  },
};

// Dashboard
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    if (isDemoMode) {
      await delay(300);
      return generateFilteredDashboardStats(getDemoDevices(), getDemoAlerts());
    }
    return traccarApi.fetchStats();
  },
};

// Devices
export const devicesApi = {
  getAll: async (filter?: DeviceFilter): Promise<Device[]> => {
    if (isDemoMode) {
      await delay(300);
      // Apply role-based filtering first
      let devices = filterDevicesByRole(getDemoDevices());
      
      // Then apply user-specified filters
      if (filter?.search) {
        const search = filter.search.toLowerCase();
        devices = devices.filter(d => 
          d.name.toLowerCase().includes(search) ||
          d.imei.includes(search) ||
          d.attributes?.licensePlate?.toLowerCase().includes(search)
        );
      }
      if (filter?.status) {
        devices = devices.filter(d => d.status === filter.status);
      }
      if (filter?.groupId) {
        devices = devices.filter(d => d.groupId === filter.groupId);
      }
      if (filter?.type) {
        devices = devices.filter(d => d.type === filter.type);
      }
      
      return devices;
    }
    return applyDeviceFilter(await traccarApi.fetchDevices(), filter);
  },

  getById: async (id: string): Promise<Device> => {
    if (isDemoMode) {
      await delay(200);
      const device = getDemoDevices().find(d => d.id === id);
      if (!device) throw new Error('Device not found');
      return device;
    }
    const device = (await traccarApi.fetchDevices()).find((d) => d.id === id);
    if (!device) throw new Error('Device not found');
    return device;
  },

  getPositions: async (deviceId: string, from?: string, to?: string): Promise<Position[]> => {
    if (isDemoMode) {
      await delay(200);
      const device = getDemoDevices().find(d => d.id === deviceId);
      if (!device?.lastPosition) return [];
      
      // Generate historical positions
      const positions: Position[] = [];
      let currentPos = device.lastPosition;
      for (let i = 0; i < 100; i++) {
        positions.push(currentPos);
        currentPos = simulatePositionUpdate(currentPos);
      }
      return positions.reverse();
    }
    return traccarApi.fetchPositions(deviceId, from, to);
  },

  create: async (device: Partial<Device>): Promise<Device> => {
    if (isDemoMode) {
      await delay(500);
      const newDevice: Device = {
        ...device as Device,
        id: `dev-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoDevices = [...getDemoDevices(), newDevice];
      return newDevice;
    }
    const response = await traccarApi.traccar.post('/api/devices', traccarApi.fromDevice(device));
    return traccarApi.toDevice(response.data);
  },

  update: async (id: string, device: Partial<Device>): Promise<Device> => {
    if (isDemoMode) {
      await delay(500);
      const index = getDemoDevices().findIndex(d => d.id === id);
      if (index === -1) throw new Error('Device not found');
      const updated = { ...demoDevices![index], ...device, updatedAt: new Date().toISOString() };
      demoDevices![index] = updated;
      return updated;
    }
    const existing = (await traccarApi.traccar.get(`/api/devices/${id}`)).data;
    const response = await traccarApi.traccar.put(`/api/devices/${id}`, traccarApi.fromDevice(device, existing));
    return traccarApi.toDevice(response.data);
  },

  delete: async (id: string): Promise<void> => {
    if (isDemoMode) {
      await delay(500);
      demoDevices = getDemoDevices().filter(d => d.id !== id);
      return;
    }
    await traccarApi.traccar.delete(`/api/devices/${id}`);
  },
};

// Rides/Trips
export const ridesApi = {
  getAll: async (filter?: RideFilter): Promise<Ride[]> => {
    if (isDemoMode) {
      await delay(300);
      // Apply role-based filtering first
      let rides = filterRidesByRole(getDemoRides(), getDemoDevices());
      
      // Then apply user-specified filters
      if (filter?.deviceId) {
        rides = rides.filter(r => r.deviceId === filter.deviceId);
      }
      if (filter?.status) {
        rides = rides.filter(r => r.status === filter.status);
      }
      if (filter?.startDate) {
        rides = rides.filter(r => new Date(r.startTime) >= new Date(filter.startDate!));
      }
      if (filter?.endDate) {
        rides = rides.filter(r => new Date(r.startTime) <= new Date(filter.endDate!));
      }
      
      return rides;
    }
    return fetchRides(filter);
  },

  getById: async (id: string): Promise<Ride> => {
    if (isDemoMode) {
      await delay(200);
      const ride = getDemoRides().find(r => r.id === id);
      if (!ride) throw new Error('Ride not found');
      return ride;
    }
    return traccarApi.fetchRide(id);
  },
};

// Geofences
export const geofencesApi = {
  getAll: async (): Promise<Geofence[]> => {
    if (isDemoMode) {
      await delay(300);
      return getDemoGeofences();
    }
    const response = await traccarApi.traccar.get('/api/geofences');
    return response.data.map(traccarApi.toGeofence);
  },

  getById: async (id: string): Promise<Geofence> => {
    if (isDemoMode) {
      await delay(200);
      const geofence = getDemoGeofences().find(g => g.id === id);
      if (!geofence) throw new Error('Geofence not found');
      return geofence;
    }
    const response = await traccarApi.traccar.get(`/api/geofences/${id}`);
    return traccarApi.toGeofence(response.data);
  },

  create: async (geofence: Partial<Geofence>): Promise<Geofence> => {
    if (isDemoMode) {
      await delay(500);
      const newGeofence: Geofence = {
        ...geofence as Geofence,
        id: `geo-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      demoGeofences = [...getDemoGeofences(), newGeofence];
      return newGeofence;
    }
    const response = await traccarApi.traccar.post('/api/geofences', traccarApi.fromGeofence(geofence));
    return traccarApi.toGeofence(response.data);
  },

  update: async (id: string, geofence: Partial<Geofence>): Promise<Geofence> => {
    if (isDemoMode) {
      await delay(500);
      const index = getDemoGeofences().findIndex(g => g.id === id);
      if (index === -1) throw new Error('Geofence not found');
      const updated = { ...demoGeofences![index], ...geofence };
      demoGeofences![index] = updated;
      return updated;
    }
    const existing = (await traccarApi.traccar.get(`/api/geofences/${id}`)).data;
    const response = await traccarApi.traccar.put(`/api/geofences/${id}`, traccarApi.fromGeofence(geofence, existing));
    return traccarApi.toGeofence(response.data);
  },

  delete: async (id: string): Promise<void> => {
    if (isDemoMode) {
      await delay(500);
      demoGeofences = getDemoGeofences().filter(g => g.id !== id);
      return;
    }
    await traccarApi.traccar.delete(`/api/geofences/${id}`);
  },
};

// Alerts
export const alertsApi = {
  getAll: async (filter?: AlertFilter): Promise<Alert[]> => {
    if (isDemoMode) {
      await delay(300);
      // Apply role-based filtering first
      let alerts = filterAlertsByRole(getDemoAlerts(), getDemoDevices());
      
      // Then apply user-specified filters
      if (filter?.deviceId) {
        alerts = alerts.filter(a => a.deviceId === filter.deviceId);
      }
      if (filter?.type) {
        alerts = alerts.filter(a => a.type === filter.type);
      }
      if (filter?.severity) {
        alerts = alerts.filter(a => a.severity === filter.severity);
      }
      if (filter?.isRead !== undefined) {
        alerts = alerts.filter(a => a.isRead === filter.isRead);
      }
      
      return alerts;
    }
    return fetchAlertList(filter);
  },

  markAsRead: async (id: string): Promise<void> => {
    if (isDemoMode) {
      await delay(200);
      const alert = getDemoAlerts().find(a => a.id === id);
      if (alert) alert.isRead = true;
      return;
    }
    traccarApi.markRead(id);
  },

  markAllAsRead: async (): Promise<void> => {
    if (isDemoMode) {
      await delay(200);
      getDemoAlerts().forEach(a => a.isRead = true);
      return;
    }
    traccarApi.markAllRead();
  },
};

// Groups
export const groupsApi = {
  getAll: async (): Promise<Group[]> => {
    if (isDemoMode) {
      await delay(300);
      return filterGroupsByRole(getDemoGroups());
    }
    const response = await traccarApi.traccar.get('/api/groups');
    return response.data.map(traccarApi.toGroup);
  },

  getById: async (id: string): Promise<Group> => {
    if (isDemoMode) {
      await delay(200);
      const group = getDemoGroups().find(g => g.id === id);
      if (!group) throw new Error('Group not found');
      return group;
    }
    const response = await traccarApi.traccar.get(`/api/groups/${id}`);
    return traccarApi.toGroup(response.data);
  },

  create: async (group: Partial<Group>): Promise<Group> => {
    if (isDemoMode) {
      await delay(500);
      const newGroup: Group = {
        ...group as Group,
        id: `grp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      demoGroups = [...getDemoGroups(), newGroup];
      return newGroup;
    }
    const response = await traccarApi.traccar.post('/api/groups', traccarApi.fromGroup(group));
    return traccarApi.toGroup(response.data);
  },

  update: async (id: string, group: Partial<Group>): Promise<Group> => {
    if (isDemoMode) {
      await delay(500);
      const index = getDemoGroups().findIndex(g => g.id === id);
      if (index === -1) throw new Error('Group not found');
      const updated = { ...demoGroups![index], ...group };
      demoGroups![index] = updated;
      return updated;
    }
    const existing = (await traccarApi.traccar.get(`/api/groups/${id}`)).data;
    const response = await traccarApi.traccar.put(`/api/groups/${id}`, traccarApi.fromGroup(group, existing));
    return traccarApi.toGroup(response.data);
  },

  delete: async (id: string): Promise<void> => {
    if (isDemoMode) {
      await delay(500);
      demoGroups = getDemoGroups().filter(g => g.id !== id);
      return;
    }
    await traccarApi.traccar.delete(`/api/groups/${id}`);
  },
};

// Real-time updates (WebSocket simulation for demo)
export const realtimeApi = {
  subscribeToPositions: (callback: (positions: Map<string, Position>) => void): (() => void) => {
    if (isDemoMode) {
      const interval = setInterval(() => {
        // Apply role-based filtering to real-time updates
        const devices = filterDevicesByRole(getDemoDevices());
        const positions = new Map<string, Position>();
        
        devices.forEach(device => {
          if (device.lastPosition && device.status !== 'OFFLINE') {
            const updatedPosition = simulatePositionUpdate(device.lastPosition);
            device.lastPosition = updatedPosition;
            positions.set(device.id, updatedPosition);
          }
        });
        
        callback(positions);
      }, 5000);
      
      return () => clearInterval(interval);
    }
    
    // Traccar pushes new positions over its WebSocket
    return traccarApi.subscribe((message) => {
      if (!message.positions?.length) return;
      const positions = new Map<string, Position>();
      message.positions.forEach((position) => {
        positions.set(String(position.deviceId), traccarApi.toPosition(position));
      });
      callback(positions);
    });
  },

  // Online/offline changes (demo devices never change)
  subscribeToDeviceStatus: (callback: (online: Map<string, boolean>) => void): (() => void) => {
    if (isDemoMode) return () => {};
    return traccarApi.subscribe((message) => {
      if (!message.devices?.length) return;
      callback(new Map(message.devices.map((d) => [String(d.id), d.status === 'online'])));
    });
  },

  // New alerts as they happen, like the Traccar web app
  subscribeToAlerts: (callback: (alerts: Alert[]) => void): (() => void) => {
    if (isDemoMode) return () => {};
    return traccarApi.subscribe(async (message) => {
      const events = (message.events || []).filter((e) => traccarApi.ALERT_EVENT_TYPES.includes(e.type));
      if (!events.length) return;
      const names = await traccarApi.lookups();
      callback(events.map((event) => traccarApi.toAlert(event, names.devices, names.geofences)));
    });
  },
};

export default apiClient;
