import React from 'react';
import { CheckCircle, Star, Buildings, Rocket } from '@phosphor-icons/react';
import { handleCheckout } from '../lib/stripe';

const tiers = [
    {
        name: 'Starter',
        price: 100,
        description: 'Perfect for individuals starting out with AI optimization.',
        features: [
            '25 Optimization Prompts',
            'Basic Analytics',
            'Standard Support',
            'SEO Recommendations'
        ],
        icon: Star,
        color: 'blue',
        stripePriceId: 'price_starter_placeholder'
    },
    {
        name: 'Pro',
        price: 200,
        description: 'Ideal for growing businesses and content teams.',
        features: [
            '100 Optimization Prompts',
            'Advanced Analytics',
            'Priority Support',
            'Everything in Starter',
            'Bulk Processing'
        ],
        icon: Rocket,
        color: 'violet',
        highlight: true,
        stripePriceId: 'price_pro_placeholder'
    },
    {
        name: 'Enterprise',
        price: 500,
        description: 'For large organizations requiring maximum scale.',
        features: [
            'Custom Volume (Discuss needs)',
            'Custom Integration',
            'Dedicated Account Manager',
            'API Access',
            'SSO & Advanced Security'
        ],
        icon: Buildings,
        color: 'slate',
        stripePriceId: 'price_enterprise_placeholder'
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Choose the plan that fits your content needs. Scale as you grow.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`clean-card relative rounded-2xl p-8 transition-all duration-300 ${tier.highlight
                                ? 'border-brand-500 shadow-xl scale-105 z-10 ring-1 ring-brand-500/20'
                                : 'border-white hover:border-brand-200'
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-700 text-white text-sm font-semibold py-1 px-4 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center text-2xl ${tier.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                tier.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                <tier.icon weight="bold" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                            <div className="mt-4 flex items-baseline text-slate-900">
                                <span className="text-4xl font-bold tracking-tight">${tier.price}</span>
                                <span className="ml-1 text-lg font-semibold text-slate-500">/mo</span>
                            </div>
                            <p className="mt-2 text-slate-600">{tier.description}</p>

                            <ul className="mt-8 space-y-4">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500 mt-1" weight="fill" />
                                        <span className="ml-3 text-slate-600 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCheckout(tier.stripePriceId)}
                                className={`mt-8 w-full py-3 px-4 rounded-xl font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${tier.highlight
                                    ? 'bg-brand-700 text-white hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-500/25'
                                    : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                                    }`}>
                                Get {tier.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
