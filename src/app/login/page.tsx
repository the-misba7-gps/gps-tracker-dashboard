'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store';
import { SignalIcon, EnvelopeIcon, LockClosedIcon, UserIcon, TruckIcon, MapPinIcon, HomeModernIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const handleDemoLogin = (role: 'ADMIN' | 'FLEET_MANAGER' | 'DRIVER' | 'OWNER') => {
    // Role-based demo user configurations
    const demoUserConfigs: Record<string, {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      groupId?: string;
      assignedDeviceId?: string;
    }> = {
      ADMIN: {
        id: 'demo-admin',
        email: 'admin@tracker.com',
        firstName: 'Admin',
        lastName: 'User',
      },
      FLEET_MANAGER: {
        id: 'demo-fleet-manager',
        email: 'manager@tracker.com',
        firstName: 'Fleet',
        lastName: 'Manager',
        groupId: 'grp-1', // Manages Delivery Fleet
      },
      DRIVER: {
        id: 'demo-driver',
        email: 'driver@tracker.com',
        firstName: 'John',
        lastName: 'Driver',
        groupId: 'grp-1',
        assignedDeviceId: 'dev-1', // Assigned to first vehicle
      },
      OWNER: {
        id: 'demo-owner',
        email: 'owner@tracker.com',
        firstName: 'Personal',
        lastName: 'Owner',
        groupId: 'grp-personal', // Personal vehicles group
      },
    };

    const config = demoUserConfigs[role];
    const mockUser = {
      ...config,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    useAuthStore.getState().setUser(mockUser as any); 
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-4 ring-4 ring-blue-500/30">
            <SignalIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GPS Tracker</h1>
          <p className="text-slate-400 mt-2 text-lg">Fleet Management System</p>
        </div>

        {/* Login form */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-slate-900/95">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Sign in to your account
              </p>
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tracker.com"
              leftIcon={<EnvelopeIcon className="h-5 w-5" />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              leftIcon={<LockClosedIcon className="h-5 w-5" />}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5" isLoading={isLoading}>
              Sign In
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 font-medium">
                  Demo Access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleDemoLogin('ADMIN')}
              >
                <div className="bg-purple-100 p-1 rounded mr-3">
                  <UserIcon className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Admin Demo</div>
                  <div className="text-xs text-slate-500">Full access to all features</div>
                </div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleDemoLogin('FLEET_MANAGER')}
              >
                <div className="bg-blue-100 p-1 rounded mr-3">
                  <TruckIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Manager Demo</div>
                  <div className="text-xs text-slate-500">Fleet management access</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleDemoLogin('OWNER')}
              >
                <div className="bg-amber-100 p-1 rounded mr-3">
                  <HomeModernIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Owner Demo</div>
                  <div className="text-xs text-slate-500">Personal vehicle tracking</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleDemoLogin('DRIVER')}
              >
                <div className="bg-green-100 p-1 rounded mr-3">
                  <MapPinIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Driver Demo</div>
                  <div className="text-xs text-slate-500">Assigned vehicle only</div>
                </div>
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} GPS Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}
