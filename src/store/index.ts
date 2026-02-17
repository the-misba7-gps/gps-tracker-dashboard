import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Device, Position, Alert, DashboardStats, Geofence } from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      skipHydration: true,
    }
  )
);

// Device Store
interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  positions: Map<string, Position>;
  isLoading: boolean;
  setDevices: (devices: Device[]) => void;
  setSelectedDevice: (device: Device | null) => void;
  updatePosition: (deviceId: string, position: Position) => void;
  updatePositions: (positions: Map<string, Position>) => void;
  setLoading: (loading: boolean) => void;
}

export const useDeviceStore = create<DeviceState>()((set, get) => ({
  devices: [],
  selectedDevice: null,
  positions: new Map(),
  isLoading: false,
  setDevices: (devices) => set({ devices }),
  setSelectedDevice: (selectedDevice) => set({ selectedDevice }),
  updatePosition: (deviceId, position) => {
    const positions = new Map(get().positions);
    positions.set(deviceId, position);
    
    const devices = get().devices.map(device => {
      if (device.id === deviceId) {
        return { ...device, lastPosition: position };
      }
      return device;
    });
    
    set({ positions, devices });
  },
  updatePositions: (newPositions) => {
    const positions = new Map(get().positions);
    newPositions.forEach((position, deviceId) => {
      positions.set(deviceId, position);
    });
    
    const devices = get().devices.map(device => {
      const position = newPositions.get(device.id);
      if (position) {
        return { ...device, lastPosition: position };
      }
      return device;
    });
    
    set({ positions, devices });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));

// Alert Store
interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAlertStore = create<AlertState>()((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  setAlerts: (alerts) => set({ 
    alerts, 
    unreadCount: alerts.filter(a => !a.isRead).length 
  }),
  addAlert: (alert) => {
    const alerts = [alert, ...get().alerts];
    set({ 
      alerts, 
      unreadCount: alerts.filter(a => !a.isRead).length 
    });
  },
  markAsRead: (id) => {
    const alerts = get().alerts.map(a => 
      a.id === id ? { ...a, isRead: true } : a
    );
    set({ 
      alerts, 
      unreadCount: alerts.filter(a => !a.isRead).length 
    });
  },
  markAllAsRead: () => {
    const alerts = get().alerts.map(a => ({ ...a, isRead: true }));
    set({ alerts, unreadCount: 0 });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));

// Dashboard Store
interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  stats: null,
  isLoading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  mapCenter: [number, number];
  mapZoom: number;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  toggleDarkMode: () => void;
  setMapView: (center: [number, number], zoom: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      darkMode: false,
      mapCenter: [40.7128, -74.006],
      mapZoom: 12,
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      toggleSidebarCollapse: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', newDarkMode);
        }
        set({ darkMode: newDarkMode });
      },
      setMapView: (mapCenter, mapZoom) => set({ mapCenter, mapZoom }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed, 
        darkMode: state.darkMode 
      }),
      skipHydration: true,
    }
  )
);

// Geofence Store
interface GeofenceState {
  geofences: Geofence[];
  selectedGeofence: Geofence | null;
  isLoading: boolean;
  setGeofences: (geofences: Geofence[]) => void;
  setSelectedGeofence: (geofence: Geofence | null) => void;
  addGeofence: (geofence: Geofence) => void;
  updateGeofence: (id: string, geofence: Partial<Geofence>) => void;
  removeGeofence: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useGeofenceStore = create<GeofenceState>()((set, get) => ({
  geofences: [],
  selectedGeofence: null,
  isLoading: false,
  setGeofences: (geofences) => set({ geofences }),
  setSelectedGeofence: (selectedGeofence) => set({ selectedGeofence }),
  addGeofence: (geofence) => set({ geofences: [...get().geofences, geofence] }),
  updateGeofence: (id, updates) => {
    const geofences = get().geofences.map(g => 
      g.id === id ? { ...g, ...updates } : g
    );
    set({ geofences });
  },
  removeGeofence: (id) => {
    const geofences = get().geofences.filter(g => g.id !== id);
    set({ geofences });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
