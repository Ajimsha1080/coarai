import React from 'react';
import { motion } from 'framer-motion';
import { WarningCircle, CheckCircle, Info } from '@phosphor-icons/react';

const GeoBrandAuditScores = ({ scores = { aiAccuracy: 5, contentCompleteness: 0, geoReadiness: 0 } }) => {

    const metrics = [
        { key: 'aiAccuracy', label: 'AI Accuracy', description: 'How accurately AI models represent your brand facts.' },
        { key: 'contentContextClarity', label: 'Content Context Clarity', description: 'How clearly your provided context explains your brand.' },
        { key: 'contentCompleteness', label: 'Content Completeness', description: 'Coverage of key brand pillars in your provided text.' },
        { key: 'geoReadiness', label: 'GEO Readiness', description: 'Optimization for AI citation and zero-click summaries.' }
    ];

    const getColor = (score) => {
        if (score <= 30) return 'bg-red-500 text-red-700';
        if (score <= 60) return 'bg-amber-400 text-amber-700';
        return 'bg-emerald-500 text-emerald-700';
    };

    const getStatusLabel = (score) => {
        if (score <= 30) return 'Critical';
        if (score <= 60) return 'Needs Improvement';
        return 'Good';
    };

    const getBarColor = (score) => {
        if (score <= 30) return 'bg-red-500';
        if (score <= 60) return 'bg-amber-400';
        return 'bg-emerald-500';
    };

    return (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm clean-card">
            <div className="mb-8">
                <h3 className="text-xl font-display font-bold text-slate-900 mb-1">GEO Brand Audit – Score Breakdown</h3>
                <p className="text-slate-500 text-sm">How well AI systems understand your brand</p>
            </div>

            <div className="space-y-6">
                {metrics.map((metric) => {
                    const score = scores[metric.key] || 0;
                    const status = getStatusLabel(score);
                    const barColor = getBarColor(score);
                    const textColor = getColor(score);

                    return (
                        <div key={metric.key} className="relative group">
                            {/* Header: Label + Tooltip */}
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2 cursor-help">
                                    <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{metric.label}</span>
                                    <Info className="text-slate-300 hover:text-slate-500 transition-colors" size={14} />

                                    {/* Tooltip */}
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl z-10 pointer-events-none">
                                        {metric.description}
                                        <div className="absolute left-4 -bottom-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-opacity-10 ${textColor.replace('text-', 'bg-')}`}>
                                        {status}
                                    </span>
                                    <span className="font-mono font-bold text-slate-900">{score} <span className="text-slate-400 text-xs">/ 100</span></span>
                                </div>
                            </div>

                            {/* Bar Container */}
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
                                {/* Grid Lines (Optional subtle texture) */}
                                <div className="absolute inset-0 flex">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                        <div key={i} className="flex-1 border-r border-slate-200/50 last:border-0"></div>
                                    ))}
                                </div>

                                {/* Animated Bar */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(score, score === 0 ? 2 : 0)}%` }} // Ensure generic 0 has tiny width if preferred, or handle explicitly
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${barColor} rounded-full relative`}
                                >
                                    {/* Shine effect */}
                                    <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/20 to-transparent"></div>
                                </motion.div>
                            </div>

                            {/* Empty State Helper */}
                            {score === 0 && (
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-red-500 animate-pulse">
                                    <WarningCircle size={12} weight="bold" />
                                    <span>No content provided. Add website content to improve scores.</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Scores are generated using prompt-based AI answer simulations, not real-time AI engine data.
                </p>
            </div>
        </div>
    );
};

export default GeoBrandAuditScores;
