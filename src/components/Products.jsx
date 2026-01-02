import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, CaretRight, Sparkle, Brain, YoutubeLogo, ChartLineUp, MagicWand, TrendUp } from '@phosphor-icons/react';

export default function Products() {
    return (
        <section id="products" className="py-20 bg-slate-50 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-display font-bold text-slate-900">Our Products</h2>
                    <p className="mt-4 text-slate-600">Tools designed to dominate the AI search landscape.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* 01: AI Questioner */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl hover:border-brand-500 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-brand-50/50 transition-colors">
                            01
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <MagnifyingGlass weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">AI Questioner</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Discover exactly what users are asking online. Our engine analyses real-time search data using Tavily to identify the high-intent questions your audience needs answers to right now.
                        </p>
                        <Link to="/questioner" className="inline-flex items-center text-brand-700 font-bold hover:text-brand-800 transition-colors group-hover:translate-x-1 duration-300">
                            Start Research <CaretRight className="ml-2" weight="bold" />
                        </Link>
                    </div>

                    {/* 02: AI Content Optimizer */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl hover:border-purple-500 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-purple-50/50 transition-colors">
                            02
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <Sparkle weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">AI Content Optimizer</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Turn insights into authority. Automatically generate citation-optimized answers, structured specifically to be picked up by AI Overviews and Answer Engines like Perplexity.
                        </p>
                        <Link to="/optimizer" className="inline-flex items-center text-purple-700 font-bold hover:text-purple-800 transition-colors group-hover:translate-x-1 duration-300">
                            Generate Content <CaretRight className="ml-2" weight="bold" />
                        </Link>
                    </div>

                    {/* 03: Content Gap Audit */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl hover:border-blue-500 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-blue-50/50 transition-colors">
                            03
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <MagnifyingGlass weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Content Gap Audit</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Compare your product features against public perception. Detect narrative gaps using Deep Research and automatically generate optimized bridge content.
                        </p>
                        <Link to="/seo-audit" className="inline-flex items-center text-blue-700 font-bold hover:text-blue-800 transition-colors group-hover:translate-x-1 duration-300">
                            Run Audit <CaretRight className="ml-2" weight="bold" />
                        </Link>
                    </div>

                    {/* 04: GEO Brand Audit */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl hover:border-violet-500 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-violet-50/50 transition-colors">
                            04
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <Brain weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">GEO Brand Audit</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Simulate how generative engines perceive your brand. Get a comprehensive AI accuracy score, completeness check, and actionable differentiation strategy.
                        </p>
                        <Link to="/brand-audit" className="inline-flex items-center text-violet-600 font-bold hover:text-violet-700 transition-colors group-hover:translate-x-1 duration-300">
                            Start Analyst <CaretRight className="ml-2" weight="bold" />
                        </Link>
                    </div>

                    {/* 05: AI Visibility Monitor */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl hover:border-emerald-500 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-emerald-50/50 transition-colors">
                            05
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <ChartLineUp weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">AI Visibility Monitor</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Monitor your brand's presence in AI-generated answers. Track mentions, share of voice, and sentiment across platforms like Gemini, ChatGPT, and Perplexity.
                        </p>
                        <Link to="/ai-monitor" className="inline-flex items-center text-emerald-600 font-bold hover:text-emerald-700 transition-colors group-hover:translate-x-1 duration-300">
                            Monitor Brand <CaretRight className="ml-2" weight="bold" />
                        </Link>
                    </div>

                    {/* 06: Script Optimizer (NEW) */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl hover:border-indigo-500 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-indigo-50/50 transition-colors">
                            06
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <MagicWand weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Script Optimizer</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Convert scripts and drafts into AI-readable content. Automatically structure content with Semantic Markdown to maximize citation potential.
                        </p>
                        <Link to="/script-optimizer" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors group-hover:translate-x-1 duration-300">
                            Optimize Script <CaretRight className="ml-2" weight="bold" />
                        </Link>
                    </div>

                    {/* 07: Prompt Drift Monitor (NEW) */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl hover:border-rose-500 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-rose-50/50 transition-colors">
                            07
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <TrendUp weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Prompt Drift Monitor</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Detect stability issues in AI responses. Run session-based comparison scans to see if your brand visibility is stable or drifting over time.
                        </p>
                        <Link to="/prompt-drift" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-700 transition-colors group-hover:translate-x-1 duration-300">
                            Check Drift <CaretRight className="ml-2" weight="bold" />
                        </Link>
                    </div>

                    {/* 08: Coming Soon */}
                    <div className="clean-card group relative bg-white p-8 rounded-2xl border border-slate-100 opacity-75 hover:opacity-100 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-red-50/50 transition-colors">
                            08
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <YoutubeLogo weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">YouTube Optimizer</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Advanced ranking tools for video content. Optimize captions and metadata for the next generation of multimodal search.
                        </p>
                        <span className="inline-flex items-center text-slate-500 font-bold bg-slate-200 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                            Coming Soon
                        </span>
                    </div>

                </div>
            </div>
        </section>
    );
}
