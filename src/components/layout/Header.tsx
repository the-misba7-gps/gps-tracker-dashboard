'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useUIStore, useAlertStore, useAuthStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function Header() {
  const { toggleSidebar, sidebarCollapsed, toggleSidebarCollapse, darkMode, toggleDarkMode } = useUIStore();
  const { unreadCount } = useAlertStore();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-dark-text lg:hidden"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Desktop collapse button */}
      <button
        type="button"
        className="hidden lg:block -m-2.5 p-2.5 text-gray-700 dark:text-dark-text"
        onClick={toggleSidebarCollapse}
      >
        <span className="sr-only">Toggle sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-gray-200 dark:bg-dark-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search - can be expanded later */}
        <div className="flex flex-1 items-center">
          {/* Placeholder for search or breadcrumbs */}
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Dark mode toggle */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-dark-muted dark:hover:text-dark-text"
            onClick={toggleDarkMode}
          >
            <span className="sr-only">Toggle dark mode</span>
            {darkMode ? (
              <SunIcon className="h-6 w-6" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>

          {/* Notifications */}
          <Link
            href="/alerts"
            className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-dark-muted dark:hover:text-dark-text"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-dark-border" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <UserCircleIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-dark-text">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" />
              </span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-dark-card py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-dark-border focus:outline-none">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                    {user?.email}
                  </p>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/settings"
                      className={cn(
                        active ? 'bg-gray-50 dark:bg-dark-border' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text'
                      )}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={cn(
                        active ? 'bg-gray-50 dark:bg-dark-border' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
