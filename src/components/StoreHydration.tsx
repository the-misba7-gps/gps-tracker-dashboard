'use client';

import { useEffect } from 'react';
import { useAuthStore, useUIStore } from '@/store';

export function StoreHydration() {
  useEffect(() => {
    // Hydrate stores on client side
    useAuthStore.persist.rehydrate();
    useUIStore.persist.rehydrate();
  }, []);

  return null;
}
