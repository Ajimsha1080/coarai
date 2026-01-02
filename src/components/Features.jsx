import React from 'react';
import { MagnifyingGlass, Lightning, Rocket } from '@phosphor-icons/react';

export default function Features() {
    return (
        <section id="features" className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-display font-bold text-slate-900">Why optimize for AI?</h2>
                    <p className="mt-4 text-slate-600">The search landscape is changing. Be the answer engine's favorite source.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1: Deep Research (Questioner/Optimizer) */}
                    <div className="clean-card p-8 rounded-2xl bg-white hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
                            <MagnifyingGlass weight="bold" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Deep Market Intelligence</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Don't guess what users want. Our multi-agent system uses Tavily to scan the real-time web to uncover high-intent questions and generate authoritative answers.
                        </p>
                    </div>
                    {/* Feature 2: Strategic Gap Analysis (SEO/Content Gap Audit) */}
                    <div className="clean-card p-8 rounded-2xl bg-white hover:bg-violet-50/50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
                            <Lightning weight="bold" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Strategic Gap Detection</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Compare your "internal truth" against public AI perception. Automatically detect narrative gaps in your content and generate optimized bridges to fix them.
                        </p>
                    </div>
                    {/* Feature 3: Visibility Monitor (AI Monitor) */}
                    <div className="clean-card p-8 rounded-2xl bg-white hover:bg-emerald-50/50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
                            <Rocket weight="bold" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time AI Monitoring</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Track your share of voice in the generative era. Monitor exactly how Gemini and ChatGPT position your brand against competitors in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
