'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const screenshots = [
  {
    id: 1,
    title: 'Real-Time Dashboard',
    description: 'Monitor all your vehicles from a single, intuitive dashboard with live updates.',
    image: '/api/placeholder/800/500', // We'll create a mock dashboard image
    features: ['Live vehicle status', 'Interactive maps', 'Quick statistics', 'Alert notifications']
  },
  {
    id: 2,
    title: 'Interactive Map View',
    description: 'Track vehicle locations with detailed maps, routes, and geofencing capabilities.',
    image: '/api/placeholder/800/500',
    features: ['Satellite imagery', 'Route tracking', 'Geofence boundaries', 'Traffic overlay']
  },
  {
    id: 3,
    title: 'Analytics & Reports',
    description: 'Comprehensive reporting with charts, graphs, and detailed fleet analytics.',
    image: '/api/placeholder/800/500',
    features: ['Performance metrics', 'Cost analysis', 'Driver behavior', 'Maintenance schedules']
  },
  {
    id: 4,
    title: 'Mobile Experience',
    description: 'Full functionality on mobile devices with responsive design and touch optimization.',
    image: '/api/placeholder/400/600',
    features: ['Touch-friendly interface', 'Offline capability', 'Push notifications', 'Quick actions']
  }
];

export function Screenshots() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const currentScreenshot = screenshots[currentSlide];

  return (
    <section id="screenshots" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our intuitive interface designed for efficiency and ease of use.
            Every feature is built with your workflow in mind.
          </p>
          
          {/* Demo CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <button className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                <PlayIcon className="h-5 w-5 mr-2" />
                Try Live Demo
              </button>
            </Link>
            <button
              onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold border border-gray-200"
            >
              View Pricing
            </button>
          </div>
        </div>

        {/* Screenshot Carousel */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Screenshot Display */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
              {/* Browser Chrome */}
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-600 text-center">
                  app.gpstracker.com/dashboard
                </div>
              </div>
              
              {/* Mock Screenshot */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl h-80 flex items-center justify-center relative overflow-hidden">
                {currentScreenshot.id === 4 ? (
                  // Mobile mockup
                  <div className="bg-white rounded-2xl shadow-lg p-4 max-w-xs mx-auto">
                    <div className="bg-blue-600 text-white p-3 rounded-lg mb-3">
                      <div className="text-sm font-semibold">Fleet Status</div>
                      <div className="text-xs opacity-80">12 vehicles active</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs">Van #1</span>
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Online</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs">Truck #2</span>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Moving</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs">Car #3</span>
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Idle</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Desktop mockup
                  <div className="w-full h-full bg-white rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">{currentScreenshot.title}</div>
                      <div className="flex space-x-2">
                        <div className="w-20 h-6 bg-green-100 rounded flex items-center justify-center text-xs text-green-700">Online</div>
                        <div className="w-20 h-6 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-700">24 Active</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-sm font-bold text-blue-600">156</div>
                        <div className="text-xs text-gray-600">Trips</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-sm font-bold text-green-600">2.4k</div>
                        <div className="text-xs text-gray-600">Miles</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded text-center">
                        <div className="text-sm font-bold text-purple-600">98%</div>
                        <div className="text-xs text-gray-600">Uptime</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded h-32 flex items-center justify-center text-gray-500 text-sm">
                      Interactive Map View
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {currentScreenshot.title}
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              {currentScreenshot.description}
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              {currentScreenshot.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex space-x-2 mb-6">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Call to Action */}
            <Link href="/login">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                Try This Feature Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}