'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const reportTypes = [
  {
    id: 'trips',
    name: 'Trip Report',
    description: 'Detailed report of all trips with distance, duration, and route',
    icon: MapPinIcon,
  },
  {
    id: 'summary',
    name: 'Summary Report',
    description: 'Daily/weekly/monthly summary of fleet activity',
    icon: ChartBarIcon,
  },
  {
    id: 'speed',
    name: 'Speed Report',
    description: 'Speed analysis and overspeed events',
    icon: BoltIcon,
  },
  {
    id: 'idle',
    name: 'Idle Time Report',
    description: 'Analysis of idle time and engine hours',
    icon: ClockIcon,
  },
  {
    id: 'geofence',
    name: 'Geofence Report',
    description: 'Geofence entry/exit events and time spent',
    icon: MapPinIcon,
  },
  {
    id: 'fuel',
    name: 'Fuel Report',
    description: 'Fuel consumption and efficiency analysis',
    icon: TruckIcon,
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert('Report generated! (Demo mode)');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Reports</h1>
        <p className="text-gray-500 dark:text-dark-muted">
          Generate and download fleet reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report types */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all',
                      selectedReport === report.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        selectedReport === report.id
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : 'bg-gray-100 dark:bg-dark-border'
                      )}>
                        <report.icon className={cn(
                          'h-5 w-5',
                          selectedReport === report.id
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-500'
                        )} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-dark-text">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report configuration */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Report Options</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Select
                  label="Device"
                  options={[
                    { value: '', label: 'All Devices' },
                    { value: '1', label: 'Delivery Van 01' },
                    { value: '2', label: 'Truck Alpha' },
                    { value: '3', label: 'Fleet Car 03' },
                  ]}
                  placeholder="Select device"
                />

                <Select
                  label="Group"
                  options={[
                    { value: '', label: 'All Groups' },
                    { value: '1', label: 'Delivery Fleet' },
                    { value: '2', label: 'Executive Cars' },
                    { value: '3', label: 'Trucks' },
                  ]}
                  placeholder="Select group"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="From Date"
                    type="date"
                  />
                  <Input
                    label="To Date"
                    type="date"
                  />
                </div>

                <Select
                  label="Format"
                  options={[
                    { value: 'pdf', label: 'PDF' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'csv', label: 'CSV' },
                  ]}
                  defaultValue="pdf"
                />

                <Button
                  className="w-full"
                  onClick={handleGenerateReport}
                  disabled={!selectedReport || isGenerating}
                  isLoading={isGenerating}
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent reports */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                        Trip Report
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted">
                        Feb 1 - Feb 7, 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                        Summary Report
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted">
                        January 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
