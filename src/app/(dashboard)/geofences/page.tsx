'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Button, Input, Badge, Modal } from '@/components/ui';
import { geofencesApi } from '@/services/api';
import { useGeofenceStore } from '@/store';
import { Geofence } from '@/types';
import { cn } from '@/lib/utils';
import {
  PlusIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const TrackingMap = dynamic(
  () => import('@/components/maps/TrackingMap').then(mod => mod.TrackingMap),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-100 rounded-xl animate-pulse" /> }
);

export default function GeofencesPage() {
  const { geofences, setGeofences, selectedGeofence, setSelectedGeofence } = useGeofenceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleGeofences, setVisibleGeofences] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadGeofences() {
      try {
        const data = await geofencesApi.getAll();
        setGeofences(data);
        setVisibleGeofences(new Set(data.map(g => g.id)));
      } catch (error) {
        console.error('Failed to load geofences:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGeofences();
  }, [setGeofences]);

  const toggleVisibility = (id: string) => {
    setVisibleGeofences(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const displayedGeofences = geofences.filter(g => visibleGeofences.has(g.id));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Geofences</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            Create and manage geographic boundaries
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Geofence
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <TrackingMap
              devices={[]}
              geofences={displayedGeofences}
              height="500px"
            />
          </Card>
        </div>

        {/* Geofence list */}
        <div>
          <Card className="h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-dark-text">
                Geofences ({geofences.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-dark-border rounded-lg animate-pulse" />
                ))}
              </div>
            ) : geofences.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MapPinIcon className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">
                  No geofences yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">
                  Create your first geofence
                </p>
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Geofence
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3">
                {geofences.map((geofence) => (
                  <div
                    key={geofence.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors cursor-pointer',
                      selectedGeofence?.id === geofence.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                    )}
                    onClick={() => setSelectedGeofence(geofence)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: geofence.color || '#3B82F6' }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-dark-text">
                            {geofence.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-dark-muted">
                            {geofence.type} {geofence.type === 'CIRCLE' && geofence.area.radius && `- ${geofence.area.radius}m radius`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(geofence.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {visibleGeofences.has(geofence.id) ? (
                            <EyeIcon className="h-4 w-4" />
                          ) : (
                            <EyeSlashIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {geofence.description && (
                      <p className="text-sm text-gray-500 dark:text-dark-muted mt-2">
                        {geofence.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Geofence Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Geofence"
        description="Define a geographic boundary for alerts"
        size="lg"
      >
        <form className="space-y-4">
          <Input label="Name" placeholder="e.g., Warehouse Zone" />
          <Input label="Description" placeholder="Optional description" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-dark-border"
                >
                  Circle
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-dark-border"
                >
                  Polygon
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Color
              </label>
              <input
                type="color"
                defaultValue="#3B82F6"
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Click on the map to define the geofence area
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Geofence
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
