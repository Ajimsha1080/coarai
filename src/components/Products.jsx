import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, CaretRight, Sparkle, Brain, YoutubeLogo, ChartLineUp, MagicWand, TrendUp, Quotes } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function Products() {
    const navigate = useNavigate();

    return (
        <section id="products" className="py-20 bg-slate-50 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-display font-bold text-slate-900">Our Products</h2>
                    <p className="mt-4 text-slate-600">Tools designed to dominate the AI search landscape.</p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto"
                >
                    {/* 01: AI Questioner */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/questioner')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-brand-500 transition-all duration-300 cursor-pointer"
                    >
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
                        <span className="inline-flex items-center text-brand-700 font-bold hover:text-brand-800 transition-colors group-hover:translate-x-1 duration-300">
                            Start Research <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 02: AI Content Optimizer */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/optimizer')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-purple-500 transition-all duration-300 cursor-pointer"
                    >
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
                        <span className="inline-flex items-center text-purple-700 font-bold hover:text-purple-800 transition-colors group-hover:translate-x-1 duration-300">
                            Generate Content <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 03: Content Gap Audit */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/seo-audit')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-blue-500 transition-all duration-300 cursor-pointer"
                    >
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
                        <span className="inline-flex items-center text-blue-700 font-bold hover:text-blue-800 transition-colors group-hover:translate-x-1 duration-300">
                            Run Audit <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 04: GEO Brand Audit */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/brand-audit')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-violet-500 transition-all duration-300 cursor-pointer"
                    >
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
                        <span className="inline-flex items-center text-violet-600 font-bold hover:text-violet-700 transition-colors group-hover:translate-x-1 duration-300">
                            Start Analyst <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 05: AI Visibility Monitor */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/ai-monitor')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-emerald-500 transition-all duration-300 cursor-pointer"
                    >
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
                        <span className="inline-flex items-center text-emerald-600 font-bold hover:text-emerald-700 transition-colors group-hover:translate-x-1 duration-300">
                            Monitor Brand <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 06: Script Optimizer (NEW) */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/script-optimizer')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-indigo-500 transition-all duration-300 cursor-pointer"
                    >
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
                        <span className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors group-hover:translate-x-1 duration-300">
                            Optimize Script <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 07: Prompt Drift Monitor (NEW) */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/prompt-drift')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-rose-500 transition-all duration-300 cursor-pointer"
                    >
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
                        <span className="inline-flex items-center text-rose-600 font-bold hover:text-rose-700 transition-colors group-hover:translate-x-1 duration-300">
                            Check Drift <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 08: YouTube Optimizer */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/youtube-optimizer')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-red-500 transition-all duration-300 cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-red-50/50 transition-colors">
                            08
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <YoutubeLogo weight="bold" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">YouTube Optimizer</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Advanced ranking tools for video content. Optimize captions and metadata for the next generation of multimodal search.
                        </p>
                        <span className="inline-flex items-center text-red-600 font-bold hover:text-red-700 transition-colors group-hover:translate-x-1 duration-300">
                            Optimize Video <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                    {/* 09: Citation Intelligence (NEW) */}
                    <motion.div
                        variants={item}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/citation-intelligence')}
                        className="clean-card group relative bg-white p-8 rounded-2xl hover:border-amber-500 transition-all duration-300 cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-display font-bold text-slate-50 pointer-events-none select-none -z-10 group-hover:text-amber-50/50 transition-colors">
                            09
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <Quotes weight="fill" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Citation Intelligence</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Upgrade from "mentions" to "authority". Detect if AI engines attribute claims to your brand and generate fixes for missing citations.
                        </p>
                        <span className="inline-flex items-center text-amber-600 font-bold hover:text-amber-700 transition-colors group-hover:translate-x-1 duration-300">
                            Check Authority <CaretRight className="ml-2" weight="bold" />
                        </span>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}
