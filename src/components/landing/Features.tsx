'use client';

import {
  MapPinIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellAlertIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: MapPinIcon,
    title: 'Real-Time Tracking',
    description: 'Track your vehicles with 5-second updates and pinpoint accuracy using advanced GPS technology.',
    color: 'blue'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Geofencing',
    description: 'Create custom boundaries and receive instant alerts when vehicles enter or exit designated areas.',
    color: 'green'
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics & Reports',
    description: 'Comprehensive insights into fuel consumption, driver behavior, and fleet performance metrics.',
    color: 'purple'
  },
  {
    icon: BellAlertIcon,
    title: 'Smart Alerts',
    description: 'Get notified instantly for speed violations, maintenance schedules, and emergency situations.',
    color: 'red'
  },
  {
    icon: UserGroupIcon,
    title: 'Multi-Role Access',
    description: 'Role-based dashboards for Admins, Fleet Managers, Drivers, and Individual Owners.',
    color: 'indigo'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile Ready',
    description: 'Fully responsive design that works perfectly on smartphones, tablets, and desktop computers.',
    color: 'pink'
  },
  {
    icon: ClockIcon,
    title: 'Trip History',
    description: 'Detailed trip logs with routes, durations, stops, and driver performance analysis.',
    color: 'yellow'
  },
  {
    icon: CogIcon,
    title: 'Easy Setup',
    description: 'Quick installation and intuitive interface - get your fleet tracked in minutes, not hours.',
    color: 'gray'
  }
];

const colorMap = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  pink: 'bg-pink-100 text-pink-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gray: 'bg-gray-100 text-gray-600'
};

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Fleets
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage your vehicles efficiently, improve safety, 
            and reduce operational costs in one comprehensive platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white hover:bg-blue-50/30"
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${colorMap[feature.color as keyof typeof colorMap]} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Fleet Management?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses that have improved their operations with our GPS tracking solution.
            </p>
            <button
              onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-lg"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}