# GPS Tracker Dashboard

A modern, responsive GPS tracking and fleet management web application built with Next.js 14, React 18, and TypeScript. This application is designed to work with the existing GPS tracking microservices backend.

## Features

- **Live Tracking**: Real-time map view of all devices with automatic position updates
- **Device Management**: Add, edit, and organize GPS tracking devices
- **Trip History**: View detailed trip reports with routes, distance, and duration
- **Geofences**: Create and manage geographic boundaries with alerts
- **Alerts & Notifications**: Real-time alerts for overspeed, geofence violations, and more
- **Reports**: Generate comprehensive fleet reports in multiple formats
- **Groups**: Organize devices into groups for easier management
- **Dark Mode**: Full dark theme support
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Maps**: Leaflet / React-Leaflet
- **Charts**: Chart.js
- **UI Components**: Headless UI, Heroicons
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd gps-tracker-dashboard
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SSO_URL=http://localhost:9000
NEXT_PUBLIC_DEMO_MODE=true
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Mode

By default, the application runs in demo mode with simulated data. To connect to the real backend:

1. Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env.local`
2. Configure the API and SSO URLs to point to your backend services
3. Restart the development server

## Backend Integration

This application is designed to work with the existing microservices:

- **gps-centre**: Device and user management
- **location-app**: Position data and rides (via gRPC)
- **sso**: OAuth2 authentication
- **gateway**: API gateway for routing

### API Endpoints

The application expects these REST endpoints:

- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get device details
- `GET /api/rides` - List all trips
- `GET /api/geofences` - List geofences
- `GET /api/alerts` - List alerts
- `GET /api/groups` - List groups

### Authentication

The application uses OAuth2 with PKCE flow for authentication:

1. Redirects to SSO authorization endpoint
2. Exchanges authorization code for access token
3. Includes Bearer token in API requests

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   └── login/             # Login page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── maps/              # Map components
│   └── devices/           # Device-related components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── services/              # API services
├── store/                 # Zustand stores
└── types/                 # TypeScript definitions
```

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
