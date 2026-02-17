'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Modal } from '@/components/ui';
import { groupsApi, devicesApi } from '@/services/api';
import { Group, Device } from '@/types';
import { cn } from '@/lib/utils';
import {
  PlusIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [groupsData, devicesData] = await Promise.all([
          groupsApi.getAll(),
          devicesApi.getAll(),
        ]);
        setGroups(groupsData);
        setDevices(devicesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getDevicesInGroup = (groupId: string) => {
    return devices.filter(d => d.groupId === groupId);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Groups</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            Organize devices into groups for easier management
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{groups.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TruckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{devices.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <UsersIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Ungrouped</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {devices.filter(d => !d.groupId).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Groups grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-dark-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="text-center py-12">
          <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
            No groups yet
          </h3>
          <p className="text-gray-500 dark:text-dark-muted mb-4">
            Create groups to organize your devices
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Group
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const groupDevices = getDevicesInGroup(group.id);
            const onlineDevices = groupDevices.filter(d => d.status !== 'OFFLINE').length;

            return (
              <Card
                key={group.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedGroup?.id === group.id && 'ring-2 ring-primary-500'
                )}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-gray-500 dark:text-dark-muted">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <TruckIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-dark-muted">
                        {groupDevices.length} devices
                      </span>
                    </div>
                    <Badge variant={onlineDevices > 0 ? 'success' : 'default'} size="sm">
                      {onlineDevices} online
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Group Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Group"
        description="Organize devices into a new group"
      >
        <form className="space-y-4">
          <Input label="Group Name" placeholder="e.g., Delivery Fleet" />
          <Input label="Description" placeholder="Optional description" />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
