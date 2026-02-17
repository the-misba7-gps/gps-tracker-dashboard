'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';
import { useUIStore, useAuthStore } from '@/store';
import {
  UserCircleIcon,
  BellIcon,
  MapIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', name: 'Profile', icon: UserCircleIcon, roles: ['ADMIN', 'OWNER'] },
  { id: 'notifications', name: 'Notifications', icon: BellIcon, roles: ['ADMIN', 'OWNER'] },
  { id: 'map', name: 'Map Settings', icon: MapIcon, roles: ['ADMIN', 'OWNER'] },
  { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon, roles: ['ADMIN', 'OWNER'] },
  { id: 'security', name: 'Security', icon: ShieldCheckIcon, roles: ['ADMIN'] }, // Admin only
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Settings</h1>
        <p className="text-gray-500 dark:text-dark-muted">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar navigation */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs
              .filter((tab) => tab.roles.includes(user?.role || 'VIEWER'))
              .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-dark-text dark:hover:bg-dark-border'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <UserCircleIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-gray-500 dark:text-dark-muted mt-2">
                        JPG, GIF or PNG. Max size 1MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First Name" defaultValue={user?.firstName} />
                    <Input label="Last Name" defaultValue={user?.lastName} />
                  </div>

                  <Input label="Email" type="email" defaultValue={user?.email} />
                  <Input label="Phone" type="tel" defaultValue={user?.phone} />

                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-border">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-dark-text">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">
                        Receive alerts via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-border">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-dark-text">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">
                        Receive browser push notifications
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-border">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-dark-text">
                        Speed Alerts
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">
                        Get notified when devices exceed speed limits
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-dark-text">
                        Geofence Alerts
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">
                        Alerts when devices enter/exit geofences
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'map' && (
            <Card>
              <CardHeader>
                <CardTitle>Map Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Select
                    label="Default Map Style"
                    options={[
                      { value: 'streets', label: 'Streets' },
                      { value: 'satellite', label: 'Satellite' },
                      { value: 'hybrid', label: 'Hybrid' },
                      { value: 'terrain', label: 'Terrain' },
                    ]}
                    defaultValue="streets"
                  />

                  <Select
                    label="Distance Unit"
                    options={[
                      { value: 'km', label: 'Kilometers' },
                      { value: 'mi', label: 'Miles' },
                    ]}
                    defaultValue="km"
                  />

                  <Select
                    label="Speed Unit"
                    options={[
                      { value: 'kph', label: 'km/h' },
                      { value: 'mph', label: 'mph' },
                      { value: 'knots', label: 'Knots' },
                    ]}
                    defaultValue="kph"
                  />

                  <Input
                    label="Default Map Center (Latitude)"
                    type="number"
                    step="0.0001"
                    defaultValue="40.7128"
                  />

                  <Input
                    label="Default Map Center (Longitude)"
                    type="number"
                    step="0.0001"
                    defaultValue="-74.0060"
                  />

                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-border">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-dark-text">
                        Dark Mode
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">
                        Enable dark theme for the interface
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={darkMode}
                        onChange={toggleDarkMode}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-border">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-dark-text">
                        Compact Sidebar
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">
                        Show only icons in the sidebar
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <Select
                    label="Language"
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'fr', label: 'French' },
                      { value: 'ar', label: 'Arabic' },
                    ]}
                    defaultValue="en"
                  />

                  <Select
                    label="Timezone"
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time' },
                      { value: 'Europe/London', label: 'London' },
                      { value: 'Europe/Paris', label: 'Paris' },
                      { value: 'Asia/Dubai', label: 'Dubai' },
                    ]}
                    defaultValue="UTC"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-dark-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <KeyIcon className="h-6 w-6 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-dark-text">
                          Change Password
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-muted">
                          Update your password regularly for security
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4">
                      Change Password
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-dark-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-dark-text">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-muted">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                    <h3 className="font-medium text-gray-900 dark:text-dark-text mb-4">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-dark-text">
                            Current Session
                          </p>
                          <p className="text-sm text-gray-500 dark:text-dark-muted">
                            Windows - Chrome - Now
                          </p>
                        </div>
                        <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
