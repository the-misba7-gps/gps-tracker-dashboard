'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  MapIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['ADMIN', 'FLEET_MANAGER', 'OWNER'] },
  { name: 'Live Tracking', href: '/tracking', icon: MapIcon, roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'OWNER'] },
  { name: 'Devices', href: '/devices', icon: TruckIcon, roles: ['ADMIN', 'FLEET_MANAGER', 'OWNER'] },
  { name: 'Trip History', href: '/trips', icon: ClockIcon, roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'OWNER'] },
  { name: 'Geofences', href: '/geofences', icon: MapPinIcon, roles: ['ADMIN', 'FLEET_MANAGER'] },
  { name: 'Alerts', href: '/alerts', icon: BellIcon, roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'OWNER'] },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['ADMIN', 'FLEET_MANAGER', 'OWNER'] },
  { name: 'Groups', href: '/groups', icon: UserGroupIcon, roles: ['ADMIN', 'FLEET_MANAGER'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['ADMIN', 'OWNER'] },
];

function NavLinks({ collapsed = false, onItemClick }: { collapsed?: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const userRole = user?.role || 'VIEWER';

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.filter(item => item.roles.includes(userRole)).map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
            )}
          >
            <item.icon
              className={cn(
                'flex-shrink-0 h-5 w-5',
                collapsed ? 'mx-auto' : 'mr-3',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'
              )}
            />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={toggleSidebar}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={toggleSidebar}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-dark-card px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <SignalIcon className="h-8 w-8 text-primary-600" />
                    <span className="ml-2 text-xl font-bold text-gray-900 dark:text-dark-text">
                      GPS Tracker
                    </span>
                  </div>
                  <NavLinks onItemClick={toggleSidebar} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <SignalIcon className="h-8 w-8 text-primary-600" />
            {!sidebarCollapsed && (
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-dark-text">
                GPS Tracker
              </span>
            )}
          </div>
          <NavLinks collapsed={sidebarCollapsed} />
        </div>
      </div>
    </>
  );
}
