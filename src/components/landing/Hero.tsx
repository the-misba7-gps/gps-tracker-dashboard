'use client';

import Link from 'next/link';
import { PlayIcon, MapPinIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

export function Hero() {
  const scrollToPricing = () => {
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDemo = () => {
    document.querySelector('#screenshots')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Track Your Fleet in{' '}
              <span className="text-blue-600">Real-Time</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Professional GPS tracking solution with live monitoring, geofencing, 
              and comprehensive analytics. Perfect for businesses and individuals.
            </p>

            {/* Feature highlights */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center text-gray-700">
                <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Real-time tracking</span>
              </div>
              <div className="flex items-center text-gray-700">
                <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Fleet management</span>
              </div>
              <div className="flex items-center text-gray-700">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Secure & reliable</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={scrollToPricing}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </button>
              <button
                onClick={scrollToDemo}
                className="flex items-center justify-center bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg border border-gray-200 shadow-lg"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-12 text-center lg:text-left">
              <p className="text-sm text-gray-500 mb-4">Trusted by businesses worldwide</p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-60">
                <div className="bg-gray-100 px-4 py-2 rounded text-sm font-semibold text-gray-600">
                  Fleet Co.
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded text-sm font-semibold text-gray-600">
                  Logistics Pro
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded text-sm font-semibold text-gray-600">
                  Transport Ltd
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              {/* Mock Dashboard Preview */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-white text-xs">GPS Tracker Dashboard</div>
                </div>
                <div className="bg-blue-900 rounded p-3 text-white text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span>🚛 Delivery Van 01</span>
                    <span className="bg-green-500 px-2 py-1 rounded">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🚗 Fleet Car 03</span>
                    <span className="bg-blue-500 px-2 py-1 rounded">Moving</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🏍️ Courier Bike 01</span>
                    <span className="bg-yellow-500 px-2 py-1 rounded text-black">Idle</span>
                  </div>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-600">Active Vehicles</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <div className="text-sm text-gray-600">Miles Today</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-gray-600">Alerts</div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg">
              <MapPinIcon className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
              <TruckIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}