import React, { useState, useMemo } from 'react';
import { ChartLineUp, ChartBar, Info, TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BrandAvatar from '../shared/BrandAvatar';

// Helper: Format Date
const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Sub-component: Individual Visibility Bar with Trend
const BrandVisibilityBar = ({ brand, isMe, previousPercentage }) => {
    const visualWidth = brand.percentage;

    // Calculate Trend
    let trendIcon = <Minus size={14} className="text-slate-300 dark:text-slate-600" />;
    let trendColor = 'text-slate-400 dark:text-slate-500';

    if (previousPercentage !== undefined && previousPercentage !== null) {
        const diff = brand.percentage - previousPercentage;
        if (diff > 0) {
            trendIcon = <TrendUp size={14} weight="bold" />;
            trendColor = 'text-green-500';
        } else if (diff < 0) {
            trendIcon = <TrendDown size={14} weight="bold" />;
            trendColor = 'text-red-500';
        }
    }

    return (
        <div className="group relative">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    {/* Brand Avatar */}
                    <BrandAvatar
                        brandName={brand.name}
                        brandLogoUrl={brand.brand_logo_url}
                        className={`ring-2 ring-offset-2 transition-colors ${isMe ? 'ring-orange-100 dark:ring-orange-900/30' : 'ring-slate-100 dark:ring-slate-800'}`}
                    />

                    <div className="flex flex-col leading-none">
                        <div className="flex items-center gap-2">
                            <span className={`font-display font-semibold text-sm ${isMe ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                {brand.name}
                            </span>
                            {/* Trend Indicator */}
                            <span className={`text-xs ${trendColor} flex items-center`} title={previousPercentage !== undefined ? `Previous: ${previousPercentage}%` : 'No history'}>
                                {trendIcon}
                            </span>
                        </div>
                        {isMe && <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider mt-1">You</span>}
                    </div>
                </div>
                <span className={`text-sm font-bold monospace-numerals ${isMe ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {brand.percentage}%
                </span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden relative">
                {/* Industry Average Marker (Static for now) */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600 z-10 hidden group-hover:block"
                    style={{ left: '23%' }}
                    title="Industry Average: 23%"
                />

                {/* Fill Bar */}
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isMe
                        ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                        : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        }`}
                    style={{ width: `${visualWidth}%` }}
                >
                    {visualWidth > 0 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white/50 rounded-full mr-1"></div>
                    )}
                </div>
            </div>

            {/* Tooltip for 0 state */}
            {brand.percentage === 0 && !isMe && (
                <div className="absolute top-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-800 dark:bg-slate-700 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
                    <p>No mentions in monitored prompts.</p>
                </div>
            )}
        </div>
    );
};

// Main Component
export default function MarketPositionChart({ data, myBrand, history = [] }) {
    const [view, setView] = useState('distribution'); // 'distribution' | 'trend'

    // --- 1. Prepare Trend Data (Line Chart) ---
    const trendData = useMemo(() => {
        if (!history || history.length < 2) return [];

        // Sort history by date ascending (oldest first) for chart
        const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));

        return sortedHistory.map(run => {
            // Need to exact visibility score for "myBrand" from this run
            // run.metrics.visibilityScore is the aggregate for "myBrand" usually
            // but let's double check if we stored it?
            // In AiMonitorPage line 116: visibilityScore: Math.round((metrics.brandMentions / totalSteps) * 100)
            // YES, it is stored.
            return {
                date: formatDate(run.timestamp || run.createdAt),
                visibility: run.metrics?.visibilityScore || 0
            };
        });
    }, [history]);

    // --- 2. Calculate Previous Scores for Leaderboard ---
    const previousScores = useMemo(() => {
        if (!history || history.length < 2) return {}; // Need at least 2 runs to compare

        // history[0] is current, history[1] is previous
        const prevRun = history[1];
        if (!prevRun || !prevRun.responses) return {};

        // Recalculate percentages for the previous run manually
        // Since we don't store per-competitor percentage in 'metrics' object explicitly in a map,
        // we have to re-aggregate from 'prevRun.responses' like we do in MonitorDashboard.

        const stats = {};
        const totalPrompts = prevRun.metrics?.totalPrompts || prevRun.responses.length || 1;

        // Initialize
        if (prevRun.config?.competitors) {
            prevRun.config.competitors.forEach(c => stats[c] = 0);
        }
        stats[prevRun.config?.brandName || myBrand] = 0;

        // Count
        prevRun.responses.forEach(r => {
            if (r.analysis.mentioned) {
                const bName = prevRun.config?.brandName || myBrand;
                stats[bName] = (stats[bName] || 0) + 1;
            }
            r.analysis.competitors_mentioned?.forEach(c => {
                // Simple matching logic
                // We just need to key it correctly.
                // Ideally we fuzzy match but simple key access is fast.
                stats[c] = (stats[c] || 0) + 1;
            });
        });

        // Convert to percentages
        const scores = {};
        Object.keys(stats).forEach(key => {
            scores[key] = Math.round((stats[key] / totalPrompts) * 100);
        });

        return scores;

    }, [history, myBrand]);


    const hasData = data && data.length > 0;
    const hasTrendData = trendData.length >= 2;

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col relative overflow-hidden transition-colors duration-300">

            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Market Position</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">How often your brand appears in AI-generated answers</p>
                </div>

                {/* View Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0 scale-90 origin-top-right">
                    <button
                        onClick={() => setView('distribution')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'distribution'
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <ChartBar size={14} weight={view === 'distribution' ? 'fill' : 'regular'} />
                        Dist
                    </button>
                    <button
                        onClick={() => setView('trend')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'trend'
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <ChartLineUp size={14} weight={view === 'trend' ? 'fill' : 'regular'} />
                        Trend
                    </button>
                </div>
            </div>

            {/* Baseline Context Line */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Industry Avg: 23%</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-8"></div>
            </div>

            {/* Content Area */}
            <div className="flex-grow min-h-[250px]">
                {view === 'distribution' ? (
                    <div className="space-y-3">
                        {hasData ? (
                            data.map((brand, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        p-4 rounded-xl border transition-all
                                        ${brand.name === myBrand
                                            ? 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30'
                                            : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50'
                                        }
                                    `}
                                >
                                    <BrandVisibilityBar
                                        brand={brand}
                                        isMe={brand.name === myBrand}
                                        previousPercentage={previousScores[brand.name]}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-400 py-10">
                                No market data available yet.
                            </div>
                        )}
                    </div>
                ) : (
                    // Trend Line Chart
                    <div className="w-full h-full">
                        {hasTrendData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.2} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                                        domain={[0, 100]}
                                        unit="%"
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#1E293B', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="visibility"
                                        stroke="#FB923C" // Orange brand color
                                        strokeWidth={3}
                                        dot={{ fill: '#FB923C', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
                                <ChartLineUp size={32} className="mb-2 opacity-50" />
                                <p>Trend analysis requires historical data.</p>
                                <p className="text-xs opacity-70 mt-1">Run at least 2 audits to build a timeline.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Insight Footer - Hidden by user request */}
            {/*
            <div className="mt-8 pt-4 border-t border-slate-100">
                ...
            </div>
            */}
            <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center mt-4">
                Metrics are based on sampled AI-generated responses.
            </p>
        </div>
    );
}
