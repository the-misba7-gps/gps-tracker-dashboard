'use client';

import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed, darkMode } = useUIStore();

  useEffect(() => {
    // Apply dark mode class on mount
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Sidebar />
      
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Header />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
