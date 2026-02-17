'use client';

import {
  ShieldCheckIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const stats = [
  { label: 'Active Users', value: '10,000+', icon: UserGroupIcon },
  { label: 'Vehicles Tracked', value: '50,000+', icon: TruckIcon },
  { label: 'Countries', value: '25+', icon: GlobeAltIcon },
  { label: 'Uptime', value: '99.9%', icon: ClockIcon },
];

const values = [
  {
    icon: ShieldCheckIcon,
    title: 'Security First',
    description: 'Enterprise-grade encryption and security protocols protect your fleet data 24/7.'
  },
  {
    icon: ClockIcon,
    title: 'Reliability',
    description: 'Built for mission-critical operations with 99.9% uptime and redundant systems.'
  },
  {
    icon: ChartBarIcon,
    title: 'Innovation',
    description: 'Cutting-edge GPS technology and continuous updates keep you ahead of the curve.'
  },
  {
    icon: UserGroupIcon,
    title: 'Support',
    description: 'Dedicated customer success team available 24/7 to ensure your success.'
  }
];

export function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Businesses Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to make fleet management simple, efficient, and accessible 
            for businesses of all sizes. Our platform combines cutting-edge technology 
            with intuitive design.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 group-hover:bg-blue-200 transition-colors">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Built for Modern Businesses
            </h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded by fleet management experts who understood the challenges of 
                traditional tracking systems, we set out to create something better. 
                Our platform was born from real-world experience managing thousands 
                of vehicles across diverse industries.
              </p>
              <p>
                Today, we serve everyone from individual vehicle owners to enterprise 
                fleets with hundreds of vehicles. Our role-based platform adapts to 
                your needs, whether you're tracking a single family car or managing 
                a complex logistics operation.
              </p>
              <p>
                We believe that powerful fleet management shouldn't require a PhD in 
                technology. That's why we've obsessed over making our platform 
                intuitive, reliable, and genuinely helpful for your daily operations.
              </p>
            </div>
          </div>

          <div className="relative">
            {/* Team/Office Placeholder */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">GPS Tracker Team</div>
                    <div className="text-sm text-gray-600">Fleet Management Experts</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  "Dedicated to making fleet management accessible, 
                  efficient, and reliable for businesses worldwide."
                </p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600 rounded-full opacity-10"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-indigo-600 rounded-full opacity-10"></div>
          </div>
        </div>

        {/* Values Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            What Drives Us
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-7 w-7 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Thousands of Satisfied Customers?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the difference that intuitive design, reliable technology, 
              and dedicated support can make for your fleet management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Start Your Free Trial
              </button>
              <button className="text-gray-600 hover:text-gray-800 font-medium">
                Contact Our Team →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}