'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useDeviceStore } from '@/store';
import { devicesApi, realtimeApi } from '@/services/api';
import { DeviceFilter, Device } from '@/types';

export function useDevices(filter?: DeviceFilter) {
  const { 
    devices, 
    selectedDevice, 
    isLoading, 
    setDevices, 
    setSelectedDevice, 
    updatePositions,
    setLoading 
  } = useDeviceStore();
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await devicesApi.getAll(filter);
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, setDevices, setLoading]);

  const selectDevice = useCallback((device: Device | null) => {
    setSelectedDevice(device);
  }, [setSelectedDevice]);

  const subscribeToUpdates = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    unsubscribeRef.current = realtimeApi.subscribeToPositions((positions) => {
      updatePositions(positions);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [updatePositions]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    const cleanup = subscribeToUpdates();
    return cleanup;
  }, [subscribeToUpdates]);

  return {
    devices,
    selectedDevice,
    isLoading,
    fetchDevices,
    selectDevice,
  };
}

export function useDevice(id: string) {
  const { selectedDevice, setSelectedDevice, setLoading, isLoading } = useDeviceStore();

  const fetchDevice = useCallback(async () => {
    setLoading(true);
    try {
      const device = await devicesApi.getById(id);
      setSelectedDevice(device);
    } catch (error) {
      console.error('Failed to fetch device:', error);
    } finally {
      setLoading(false);
    }
  }, [id, setSelectedDevice, setLoading]);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  return {
    device: selectedDevice,
    isLoading,
    refetch: fetchDevice,
  };
}
