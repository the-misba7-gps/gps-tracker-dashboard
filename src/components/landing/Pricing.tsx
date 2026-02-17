'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon, StarIcon, TruckIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Personal',
    icon: UserIcon,
    price: { monthly: 19, yearly: 15 },
    description: 'Perfect for individual vehicle owners and small families',
    features: [
      'Up to 5 vehicles',
      'Real-time tracking',
      'Basic geofencing',
      'Trip history',
      'Mobile app access',
      'Email alerts',
      'Standard support'
    ],
    limitations: [
      'Limited reporting',
      'Basic analytics'
    ],
    popular: false,
    cta: 'Start Free Trial'
  },
  {
    name: 'Business',
    icon: TruckIcon,
    price: { monthly: 49, yearly: 39 },
    description: 'Ideal for growing businesses and small to medium fleets',
    features: [
      'Up to 50 vehicles',
      'Advanced tracking',
      'Custom geofences',
      'Detailed analytics',
      'Driver behavior monitoring',
      'Fuel consumption tracking',
      'Maintenance alerts',
      'API access',
      'Priority support'
    ],
    limitations: [],
    popular: true,
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    icon: BuildingOfficeIcon,
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'Comprehensive solution for large fleets and organizations',
    features: [
      'Unlimited vehicles',
      'Enterprise-grade security',
      'Custom integrations',
      'Advanced reporting suite',
      'Multi-location support',
      'White-label options',
      'Dedicated account manager',
      'Custom training',
      '24/7 phone support',
      'SLA guarantees'
    ],
    limitations: [],
    popular: false,
    cta: 'Contact Sales'
  }
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const handleGetStarted = (plan: typeof plans[0]) => {
    if (plan.name === 'Enterprise') {
      // Scroll to contact or handle enterprise inquiry
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      // For now, redirect to login - in production this would be signup
      window.location.href = '/login';
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start with a free trial, then choose the plan that fits your fleet size and needs. 
            All plans include our core tracking features with no setup fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isYearly ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-1 text-sm text-green-600">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = typeof plan.price.monthly === 'number' 
              ? (isYearly ? plan.price.yearly : plan.price.monthly)
              : plan.price.monthly;

            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-blue-500 scale-105' 
                    : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-3 rounded-2xl mb-4 ${
                      plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-8 w-8 ${
                        plan.popular ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {plan.description}
                    </p>

                    {/* Pricing */}
                    <div className="mb-6">
                      {typeof price === 'number' ? (
                        <div>
                          <span className="text-4xl font-bold text-gray-900">
                            ${price}
                          </span>
                          <span className="text-gray-500 font-medium">
                            /{isYearly ? 'year' : 'month'}
                          </span>
                          {isYearly && typeof plan.price.monthly === 'number' && (
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="line-through">${plan.price.monthly}/month</span>
                              <span className="ml-2 text-green-600">Save 20%</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-gray-900">
                          {price}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleGetStarted(plan)}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      What's Included:
                    </h4>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-2">
                            Limitations:
                          </h4>
                          {plan.limitations.map((limitation, limitIndex) => (
                            <div key={limitIndex} className="flex items-start">
                              <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              </div>
                              <span className="text-gray-500 text-sm">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              All Plans Include:
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center justify-center">
                <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center justify-center">
                <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
              <div className="flex items-center justify-center">
                <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                24/7 customer support
              </div>
            </div>
          </div>

          <div className="mt-8 text-gray-500 text-sm">
            <p>Questions about pricing? <a href="#" className="text-blue-600 hover:text-blue-700">Contact our sales team</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}