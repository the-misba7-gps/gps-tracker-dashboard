'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellAlertIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { alertsApi, realtimeApi } from '@/services/api';
import { useAlertStore } from '@/store';
import { Alert, AlertSeverity } from '@/types';
import { cn } from '@/lib/utils';

const TOAST_MS = 8000;

const toneOf = (severity: AlertSeverity) =>
  ({
    [AlertSeverity.CRITICAL]: 'border-red-500',
    [AlertSeverity.WARNING]: 'border-amber-500',
    [AlertSeverity.INFO]: 'border-blue-500',
  })[severity];

// Loads recent alerts for the header bell, then adds new ones as the server reports them
// and shows each new alert briefly, like the Traccar web app does.
export function LiveAlerts() {
  const { setAlerts, addAlert } = useAlertStore();
  const [toasts, setToasts] = useState<Alert[]>([]);

  useEffect(() => {
    alertsApi.getAll().then(setAlerts).catch(() => {});
  }, [setAlerts]);

  useEffect(
    () =>
      realtimeApi.subscribeToAlerts((alerts) => {
        alerts.forEach((alert) => addAlert(alert));
        setToasts((current) => [...alerts, ...current].slice(0, 3));
        alerts.forEach((alert) =>
          setTimeout(() => setToasts((current) => current.filter((t) => t.id !== alert.id)), TOAST_MS),
        );
      }),
    [addAlert],
  );

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[1000] flex w-80 flex-col gap-2" aria-live="polite">
      {toasts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 bg-white p-3 shadow-lg dark:bg-slate-800',
            toneOf(alert.severity),
          )}
        >
          <BellAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 dark:text-gray-300" />
          <Link href="/alerts" className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.deviceName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setToasts((current) => current.filter((t) => t.id !== alert.id))}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
