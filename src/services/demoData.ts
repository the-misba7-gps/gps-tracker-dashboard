import {
  Device,
  DeviceStatus,
  DeviceType,
  Position,
  Priority,
  Ride,
  RideStatus,
  Geofence,
  Alert,
  AlertType,
  AlertSeverity,
  Group,
  User,
  DashboardStats,
} from '@/types';
import { generateId, kphToKnots } from '@/lib/utils';

// Demo locations around major cities
const demoLocations = [
  // New York area
  { lat: 40.7128, lng: -74.006, city: 'New York' },
  { lat: 40.7589, lng: -73.9851, city: 'Midtown Manhattan' },
  { lat: 40.6892, lng: -74.0445, city: 'Brooklyn' },
  { lat: 40.7282, lng: -73.7949, city: 'Queens' },
  // London area
  { lat: 51.5074, lng: -0.1278, city: 'London' },
  { lat: 51.5155, lng: -0.0922, city: 'Tower Bridge' },
  { lat: 51.5033, lng: -0.1195, city: 'Westminster' },
  // Paris area
  { lat: 48.8566, lng: 2.3522, city: 'Paris' },
  { lat: 48.8584, lng: 2.2945, city: 'Eiffel Tower' },
  // Dubai area
  { lat: 25.2048, lng: 55.2708, city: 'Dubai' },
  { lat: 25.1972, lng: 55.2744, city: 'Downtown Dubai' },
  // Default center (for map)
  { lat: 36.8065, lng: 10.1815, city: 'Tunis' },
];

// Vehicle names and models
const vehicleData = [
  { name: 'Delivery Van 01', make: 'Ford', model: 'Transit', color: 'White', plate: 'ABC-1234' },
  { name: 'Truck Alpha', make: 'Mercedes', model: 'Actros', color: 'Blue', plate: 'TRK-5678' },
  { name: 'Fleet Car 03', make: 'Toyota', model: 'Camry', color: 'Silver', plate: 'CAR-9012' },
  { name: 'Service Van B2', make: 'Volkswagen', model: 'Crafter', color: 'Yellow', plate: 'SRV-3456' },
  { name: 'Executive 01', make: 'BMW', model: '5 Series', color: 'Black', plate: 'EXC-7890' },
  { name: 'Cargo Truck 02', make: 'Volvo', model: 'FH16', color: 'Red', plate: 'CGO-1122' },
  { name: 'Courier Bike 01', make: 'Honda', model: 'PCX', color: 'Green', plate: 'BKE-3344' },
  { name: 'Ambulance 01', make: 'Mercedes', model: 'Sprinter', color: 'White', plate: 'AMB-5566' },
  { name: 'School Bus 01', make: 'Blue Bird', model: 'Vision', color: 'Yellow', plate: 'SCH-7788' },
  { name: 'Taxi Fleet 12', make: 'Toyota', model: 'Prius', color: 'Yellow', plate: 'TAX-9900' },
  { name: 'Construction 03', make: 'Caterpillar', model: '740', color: 'Yellow', plate: 'CON-1133' },
  { name: 'Delivery Truck 05', make: 'Isuzu', model: 'NPR', color: 'White', plate: 'DEL-2244' },
];

// Personal vehicles for OWNER role
const personalVehicleData = [
  { name: 'Family Car', make: 'Honda', model: 'CR-V', color: 'Blue', plate: 'FAM-001' },
  { name: 'My Motorcycle', make: 'Yamaha', model: 'MT-07', color: 'Black', plate: 'BIKE-01' },
];

const driverNames = [
  'John Smith', 'Maria Garcia', 'Ahmed Hassan', 'Li Wei', 'Emma Johnson',
  'Carlos Rodriguez', 'Sarah Williams', 'Mohamed Ali', 'James Brown', 'Anna Schmidt',
  'David Lee', 'Fatima Al-Rashid',
];

// Generate demo groups
export function generateDemoGroups(): Group[] {
  return [
    { id: 'grp-1', name: 'Delivery Fleet', description: 'All delivery vehicles', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'grp-2', name: 'Executive Cars', description: 'Company executive vehicles', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'grp-3', name: 'Trucks', description: 'Heavy cargo trucks', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'grp-4', name: 'Service Vehicles', description: 'Maintenance and service fleet', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'grp-5', name: 'Public Transport', description: 'Buses and taxis', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'grp-personal', name: 'My Vehicles', description: 'Personal vehicles', createdAt: '2024-01-01T00:00:00Z' },
  ];
}

// Generate demo user
export function generateDemoUser(): User {
  return {
    id: 'user-1',
    email: 'admin@tracker.com',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567890',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };
}

// Role-based demo user profiles
export type DemoRole = 'ADMIN' | 'FLEET_MANAGER' | 'DRIVER' | 'OWNER';

interface DemoUserConfig {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: DemoRole;
  groupId?: string;
  assignedDeviceId?: string;
}

const demoUserConfigs: Record<DemoRole, DemoUserConfig> = {
  ADMIN: {
    id: 'demo-admin',
    email: 'admin@tracker.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    // Admin sees all - no groupId filter
  },
  FLEET_MANAGER: {
    id: 'demo-fleet-manager',
    email: 'manager@tracker.com',
    firstName: 'Fleet',
    lastName: 'Manager',
    role: 'FLEET_MANAGER',
    groupId: 'grp-1', // Manages Delivery Fleet
  },
  DRIVER: {
    id: 'demo-driver',
    email: 'driver@tracker.com',
    firstName: 'John',
    lastName: 'Driver',
    role: 'DRIVER',
    groupId: 'grp-1',
    assignedDeviceId: 'dev-1', // Assigned to first vehicle
  },
  OWNER: {
    id: 'demo-owner',
    email: 'owner@tracker.com',
    firstName: 'Personal',
    lastName: 'Owner',
    role: 'OWNER',
    groupId: 'grp-personal', // Personal vehicles group
  },
};

// Generate demo user by role
export function generateDemoUserByRole(role: DemoRole): User {
  const config = demoUserConfigs[role];
  return {
    ...config,
    phone: '+1234567890',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };
}

// Generate a random position near a base location
function generateRandomPosition(baseLat: number, baseLng: number, maxOffset: number = 0.05): { lat: number; lng: number } {
  const latOffset = (Math.random() - 0.5) * 2 * maxOffset;
  const lngOffset = (Math.random() - 0.5) * 2 * maxOffset;
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  };
}

// Generate personal vehicles for Owner demo
function generatePersonalDevices(): Device[] {
  const baseLocation = demoLocations[0]; // New York area for personal vehicles
  
  return personalVehicleData.map((vehicleInfo, i) => {
    const currentPos = generateRandomPosition(baseLocation.lat, baseLocation.lng, 0.02);
    // Car parked (IDLE), bike could be moving
    const status: DeviceStatus = i === 0 ? DeviceStatus.IDLE : DeviceStatus.MOVING;
    const isMoving = status === DeviceStatus.MOVING;
    
    const position: Position = {
      id: generateId(),
      imei: `86606906200${1000 + i}`,
      deviceId: `dev-personal-${i + 1}`,
      groupId: 'grp-personal',
      serverTime: new Date().toISOString(),
      deviceTime: new Date(Date.now() - Math.random() * 300000).toISOString(),
      valid: true,
      latitude: currentPos.lat,
      longitude: currentPos.lng,
      altitude: 50 + Math.random() * 50,
      speed: isMoving ? kphToKnots(30 + Math.random() * 40) : 0,
      course: Math.random() * 360,
      priority: Priority.LOW,
      attributes: {
        satellites: 10 + Math.floor(Math.random() * 4),
        ignition: true, // Personal vehicles are typically on
        motion: isMoving,
        battery: 85 + Math.random() * 15,
        power: 12 + Math.random() * 2,
        fuel: 50 + Math.random() * 50,
        odometer: 5000 + Math.random() * 30000,
      },
    };

    return {
      id: `dev-personal-${i + 1}`,
      imei: `86606906200${1000 + i}`,
      name: vehicleInfo.name,
      type: i === 1 ? DeviceType.PERSONAL : DeviceType.VEHICLE, // Motorcycle as PERSONAL type
      model: 'FMC130',
      phone: `+1555${String(2000000 + i).slice(1)}`,
      groupId: 'grp-personal',
      groupName: 'My Vehicles',
      status: status,
      lastPosition: position,
      attributes: {
        licensePlate: vehicleInfo.plate,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        color: vehicleInfo.color,
        fuelCapacity: i === 0 ? 50 : 15, // Car vs motorcycle
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };
  });
}

// Generate demo devices with positions
export function generateDemoDevices(count: number = 12): Device[] {
  const statuses = [DeviceStatus.ONLINE, DeviceStatus.MOVING, DeviceStatus.IDLE, DeviceStatus.STOPPED, DeviceStatus.OFFLINE];
  const statusWeights = [0.2, 0.35, 0.2, 0.15, 0.1];
  const groups = generateDemoGroups().filter(g => g.id !== 'grp-personal'); // Exclude personal group for fleet
  
  const fleetDevices = Array.from({ length: count }, (_, i) => {
    const vehicleInfo = vehicleData[i % vehicleData.length];
    const baseLocation = demoLocations[i % demoLocations.length];
    const currentPos = generateRandomPosition(baseLocation.lat, baseLocation.lng);
    const statusRandom = Math.random();
    let status = DeviceStatus.ONLINE;
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (statusRandom <= cumulative) {
        status = statuses[j];
        break;
      }
    }
    
    const isMoving = status === DeviceStatus.MOVING;
    const speed = isMoving ? kphToKnots(30 + Math.random() * 70) : 0;
    const group = groups[i % groups.length];
    
    const position: Position = {
      id: generateId(),
      imei: `86606906100${8445 + i}`,
      deviceId: `dev-${i + 1}`,
      groupId: group.id,
      serverTime: new Date().toISOString(),
      deviceTime: new Date(Date.now() - Math.random() * 300000).toISOString(),
      valid: true,
      latitude: currentPos.lat,
      longitude: currentPos.lng,
      altitude: 50 + Math.random() * 200,
      speed: speed,
      course: Math.random() * 360,
      priority: Priority.LOW,
      attributes: {
        satellites: 8 + Math.floor(Math.random() * 6),
        ignition: status !== DeviceStatus.OFFLINE,
        motion: isMoving,
        battery: 80 + Math.random() * 20,
        power: 12 + Math.random() * 2,
        fuel: 20 + Math.random() * 80,
        odometer: 10000 + Math.random() * 90000,
      },
    };

    return {
      id: `dev-${i + 1}`,
      imei: `86606906100${8445 + i}`,
      name: vehicleInfo.name,
      type: i < 4 ? DeviceType.VEHICLE : i < 8 ? DeviceType.VEHICLE : DeviceType.ASSET,
      model: 'FMC920',
      phone: `+1555${String(1000000 + i).slice(1)}`,
      groupId: group.id,
      groupName: group.name,
      status: status,
      lastPosition: position,
      attributes: {
        licensePlate: vehicleInfo.plate,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        color: vehicleInfo.color,
        driverId: `drv-${i + 1}`,
        driverName: driverNames[i % driverNames.length],
        fuelCapacity: 60 + Math.random() * 40,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };
  });

  // Add personal vehicles
  const personalDevices = generatePersonalDevices();
  
  return [...fleetDevices, ...personalDevices];
}

// Generate interpolated positions for a ride
function generateRoutePoints(start: {lat: number, lng: number}, end: {lat: number, lng: number}, count: number = 20): Position[] {
    const points: Position[] = [];
    const now = new Date();
    
    for (let i = 0; i <= count; i++) {
        const ratio = i / count;
        const lat = start.lat + (end.lat - start.lat) * ratio;
        const lng = start.lng + (end.lng - start.lng) * ratio;
        
        // Add some noise
        const noisyLat = lat + (Math.random() - 0.5) * 0.002;
        const noisyLng = lng + (Math.random() - 0.5) * 0.002;
        
        points.push({
            id: generateId(),
            imei: 'demo-imei',
            deviceId: 'demo-device',
            serverTime: new Date(now.getTime() - (count - i) * 60000).toISOString(),
            deviceTime: new Date(now.getTime() - (count - i) * 60000).toISOString(),
            valid: true,
            latitude: noisyLat,
            longitude: noisyLng,
            altitude: 100,
            speed: 30 + Math.random() * 20,
            course: 0, // Simplified
            priority: Priority.LOW,
            attributes: {
                ignition: true,
                battery: 90
            }
        });
    }
    return points;
}

// Generate ride history for a device
export function generateDemoRides(devices: Device[], daysBack: number = 7): Ride[] {
  const rides: Ride[] = [];
  
  devices.forEach((device) => {
    const ridesPerDay = 2 + Math.floor(Math.random() * 3);
    
    for (let day = 0; day < daysBack; day++) {
      for (let trip = 0; trip < ridesPerDay; trip++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - day);
        startDate.setHours(6 + trip * 4 + Math.floor(Math.random() * 2));
        startDate.setMinutes(Math.floor(Math.random() * 60));
        
        const duration = 1800 + Math.random() * 7200; // 30 mins to 2.5 hours
        const endDate = new Date(startDate.getTime() + duration * 1000);
        
        const isCompleted = day > 0 || (day === 0 && endDate < new Date());
        const baseLocation = demoLocations[Math.floor(Math.random() * demoLocations.length)];
        const startPos = generateRandomPosition(baseLocation.lat, baseLocation.lng, 0.1);
        const endPos = generateRandomPosition(baseLocation.lat, baseLocation.lng, 0.1);
        
        // Generate trail
        const locations = generateRoutePoints(startPos, endPos, 50);

        rides.push({
          id: generateId(),
          imei: device.imei,
          deviceId: device.id,
          deviceName: device.name,
          groupId: device.groupId,
          distance: 5000 + Math.random() * 50000, // 5-55 km
          startStation: {
            name: `Location ${Math.floor(Math.random() * 100)}`,
            latitude: startPos.lat,
            longitude: startPos.lng,
          },
          endStation: isCompleted ? {
            name: `Location ${Math.floor(Math.random() * 100)}`,
            latitude: endPos.lat,
            longitude: endPos.lng,
          } : undefined,
          startTime: startDate.toISOString(),
          endTime: isCompleted ? endDate.toISOString() : undefined,
          status: isCompleted ? RideStatus.ENDED : RideStatus.IN_PROGRESS,
          maxSpeed: kphToKnots(80 + Math.random() * 40),
          avgSpeed: kphToKnots(30 + Math.random() * 30),
          duration: isCompleted ? duration : undefined,
          locations: locations, // Added locations trail
        });
      }
    }
  });
  
  return rides.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

// Generate demo geofences
export function generateDemoGeofences(): Geofence[] {
  return [
    {
      id: 'geo-1',
      name: 'Warehouse Zone',
      description: 'Main warehouse and loading area',
      type: 'CIRCLE',
      area: {
        center: { lat: 40.7128, lng: -74.006 },
        radius: 500,
      },
      color: '#3B82F6',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'geo-2',
      name: 'Downtown Restricted',
      description: 'No-go zone during peak hours',
      type: 'POLYGON',
      area: {
        coordinates: [
          { lat: 40.758, lng: -73.99 },
          { lat: 40.758, lng: -73.98 },
          { lat: 40.752, lng: -73.98 },
          { lat: 40.752, lng: -73.99 },
        ],
      },
      color: '#EF4444',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'geo-3',
      name: 'Airport Terminal',
      description: 'Airport pickup zone',
      type: 'CIRCLE',
      area: {
        center: { lat: 40.6413, lng: -73.7781 },
        radius: 1000,
      },
      color: '#10B981',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'geo-4',
      name: 'Office Complex',
      description: 'Corporate headquarters',
      type: 'RECTANGLE',
      area: {
        coordinates: [
          { lat: 40.7589, lng: -73.9871 },
          { lat: 40.7589, lng: -73.9831 },
          { lat: 40.7559, lng: -73.9831 },
          { lat: 40.7559, lng: -73.9871 },
        ],
      },
      color: '#8B5CF6',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];
}

// Generate demo alerts
export function generateDemoAlerts(devices: Device[]): Alert[] {
  const alertTypes: { type: AlertType; severity: AlertSeverity; message: string }[] = [
    { type: AlertType.OVERSPEED, severity: AlertSeverity.WARNING, message: 'Vehicle exceeded speed limit' },
    { type: AlertType.GEOFENCE_EXIT, severity: AlertSeverity.INFO, message: 'Vehicle exited geofence' },
    { type: AlertType.GEOFENCE_ENTER, severity: AlertSeverity.INFO, message: 'Vehicle entered geofence' },
    { type: AlertType.LOW_BATTERY, severity: AlertSeverity.WARNING, message: 'Device battery is low' },
    { type: AlertType.HARSH_BRAKING, severity: AlertSeverity.WARNING, message: 'Harsh braking detected' },
    { type: AlertType.HARSH_ACCELERATION, severity: AlertSeverity.WARNING, message: 'Harsh acceleration detected' },
    { type: AlertType.SOS, severity: AlertSeverity.CRITICAL, message: 'SOS button pressed' },
    { type: AlertType.IDLE, severity: AlertSeverity.INFO, message: 'Vehicle has been idle for extended period' },
    { type: AlertType.IGNITION_ON, severity: AlertSeverity.INFO, message: 'Ignition turned on' },
    { type: AlertType.IGNITION_OFF, severity: AlertSeverity.INFO, message: 'Ignition turned off' },
  ];

  const alerts: Alert[] = [];
  
  for (let i = 0; i < 50; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const alertInfo = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    alerts.push({
      id: generateId(),
      deviceId: device.id,
      deviceName: device.name,
      type: alertInfo.type,
      severity: alertInfo.severity,
      message: alertInfo.message,
      position: device.lastPosition,
      speed: alertInfo.type === AlertType.OVERSPEED ? kphToKnots(90 + Math.random() * 40) : undefined,
      speedLimit: alertInfo.type === AlertType.OVERSPEED ? kphToKnots(80) : undefined,
      isRead: Math.random() > 0.3,
      createdAt: createdAt.toISOString(),
    });
  }
  
  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Generate dashboard stats
export function generateDashboardStats(devices: Device[], alerts: Alert[]): DashboardStats {
  const onlineDevices = devices.filter(d => d.status !== DeviceStatus.OFFLINE).length;
  const movingDevices = devices.filter(d => d.status === DeviceStatus.MOVING).length;
  const idleDevices = devices.filter(d => d.status === DeviceStatus.IDLE || d.status === DeviceStatus.STOPPED).length;
  const offlineDevices = devices.filter(d => d.status === DeviceStatus.OFFLINE).length;
  
  const todayAlerts = alerts.filter(a => {
    const alertDate = new Date(a.createdAt);
    const today = new Date();
    return alertDate.toDateString() === today.toDateString();
  });
  
  return {
    totalDevices: devices.length,
    onlineDevices,
    movingDevices,
    idleDevices,
    offlineDevices,
    totalDistance: Math.round(1500 + Math.random() * 3000), // km today
    totalAlerts: todayAlerts.length,
    criticalAlerts: todayAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
  };
}

// Simulate position updates for real-time effect
export function simulatePositionUpdate(position: Position): Position {
  const speedKph = position.speed * 1.852; // Convert knots to kph
  const isMoving = speedKph > 5;
  
  if (!isMoving) return position;
  
  // Calculate new position based on speed and course
  const distance = (speedKph / 3600) * 5; // Distance in km for 5 second update
  const courseRad = (position.course * Math.PI) / 180;
  
  const newLat = position.latitude + (distance / 111) * Math.cos(courseRad);
  const newLng = position.longitude + (distance / (111 * Math.cos(position.latitude * Math.PI / 180))) * Math.sin(courseRad);
  
  // Add small random variations
  const courseVariation = (Math.random() - 0.5) * 10;
  const speedVariation = (Math.random() - 0.5) * 5;
  
  return {
    ...position,
    id: generateId(),
    latitude: newLat,
    longitude: newLng,
    course: (position.course + courseVariation + 360) % 360,
    speed: Math.max(0, position.speed + kphToKnots(speedVariation)),
    deviceTime: new Date().toISOString(),
    serverTime: new Date().toISOString(),
  };
}
