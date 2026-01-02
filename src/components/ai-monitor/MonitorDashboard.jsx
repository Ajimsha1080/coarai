import React from 'react';
import { Warning, Info, Sparkle, Robot, ChatCircleText, MagnifyingGlass } from '@phosphor-icons/react';

// Platform Icons Helper
const getPlatformIcon = (platformName) => {
    switch (platformName) {
        case 'ChatGPT': return <Robot size={32} weight="fill" className="text-[#10A37F]" />;
        case 'Gemini': return <Sparkle size={32} weight="fill" className="text-[#4E88FC]" />;
        case 'Perplexity': return <MagnifyingGlass size={32} weight="bold" className="text-[#22B3B8]" />;
        case 'Claude': return <ChatCircleText size={32} weight="fill" className="text-[#D97757]" />; // Using generic chat for Claude
        default: return <Robot size={32} weight="fill" className="text-slate-400" />;
    }
};

export default function MonitorDashboard({ runData, isRunning, progress }) {

    // --- 1. Loading State ---
    if (!runData && isRunning) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <div className="w-full bg-slate-200 rounded-full h-4 mb-4 overflow-hidden relative">
                    <div
                        className="bg-brand-600 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Running AI Simulation... {progress}%</h3>
                <p className="text-slate-500">Querying AI models and analyzing brand presence.</p>
            </div>
        );
    }

    if (!runData) return null;

    const { metrics, responses, config } = runData;
    const myBrand = config.brandName;

    // --- 2. Data Processing for Left Column (Market Position) ---
    // Aggregate all mentions across all prompts
    const marketStats = {};

    // Initialize with 0
    marketStats[myBrand] = 0;
    config.competitors.forEach(c => marketStats[c] = 0);

    // Count mentions
    responses.forEach(r => {
        if (r.analysis.mentioned) marketStats[myBrand]++;
        r.analysis.competitors_mentioned.forEach(c => {
            // Fuzzy match or exact match depending on data quality, simple direct access for now
            // If the key doesn't exist (unexpected competitor), add it? 
            // Better to stick to tracked list to keep UI clean.
            if (marketStats.hasOwnProperty(c)) {
                marketStats[c]++;
            } else {
                // Check if it matches a tracked competitor case-insensitively
                const match = config.competitors.find(tc => tc.toLowerCase() === c.toLowerCase());
                if (match) marketStats[match]++;
            }
        });
    });

    // Convert to array and sort
    const maxPossibleMentions = metrics.totalPrompts;
    // Wait, typically market share is handling relative to volume. 
    // Let's use % of total prompts as the "Score".

    // Find the highest absolute mention count to scale the bars visually (so the top one is full width? 
    // Or full width = 100% of prompts? User said: Width = (brand_mentions / max_mentions) * 100.
    // Let's assume max_mentions = total_prompts for absolute visibility, 
    // OR max_mentions = highest_brand_mentions for relative scaling.
    // The prompt says "max_mentions". I'll use Total Prompts as the denominator (100% visibility).

    const marketPositionData = Object.entries(marketStats)
        .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / metrics.totalPrompts) * 100)
        }))
        .sort((a, b) => b.count - a.count);


    // --- 3. Data Processing for Right Column (Platform Visibility) ---
    const platforms = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude'];

    const platformStats = platforms.map(platform => {
        const platformResponses = responses.filter(r => r.platform === platform);
        const total = platformResponses.length;
        if (total === 0) return { platform, score: 0, total: 0 };

        const mentionedCount = platformResponses.filter(r => r.analysis.mentioned).length;

        return {
            platform,
            score: Math.round((mentionedCount / total) * 100),
            total
        };
    });

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* Error Banner */}
            {metrics.errorCount > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3">
                    <Warning size={24} weight="fill" className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Audit Completed with Errors</h4>
                        <p className="text-sm opacity-90">
                            {metrics.errorCount} out of {metrics.totalPrompts} prompts failed to generate.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* COLUMN 1: MARKET POSITION */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-display font-bold text-slate-900 mb-6">Market Position</h2>

                    <div className="space-y-6">
                        {marketPositionData.map((brand, idx) => {
                            const isMe = brand.name === myBrand;
                            // Ensure at least a tiny sliver is shown so tooltip works if 0
                            const visualWidth = Math.max(brand.percentage, 2);

                            return (
                                <div key={idx} className="group relative">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className={`font-semibold ${isMe ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {brand.name} {isMe && <span className="ml-2 bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">You</span>}
                                        </span>
                                        <span className="text-sm font-medium text-slate-500">{brand.percentage}%</span>
                                    </div>

                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isMe ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}
                                            style={{ width: `${visualWidth}%` }}
                                        />
                                    </div>

                                    {brand.count === 0 && (
                                        <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded">
                                            No mentions in monitored prompts
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUMN 2: PLATFORM VISIBILITY */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <h2 className="text-xl font-display font-bold text-slate-900 mb-6">Track AI Visibility</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                        {platformStats.map((stat, idx) => (
                            <div key={idx} className="p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between h-auto min-h-[140px]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        {getPlatformIcon(stat.platform)}
                                    </div>
                                    {stat.total === 0 && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                            No Data
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-slate-500 font-medium text-sm mb-1">{stat.platform}</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-slate-900">{stat.score}%</span>
                                        <span className="text-xs text-slate-400 font-medium">visibility</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transparency Tooltip / Footer */}
            <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-medium cursor-help" title="Based on a randomized set of simulated user prompts.">
                    <Info size={16} />
                    Metrics are based on controlled prompt simulations. Results may vary in real AI conversations.
                </div>
            </div>

            {/* Detailed Table (Preserved but collapsed/minimized or just kept below?) 
                The user didn't explicitly ask for the table to be removed, but the layout description didn't mention it.
                I will include it below as "Analysis Details" to ensure functionality isn't lost, 
                but style it to map the new clean aesthetic.
            */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Analysis Log</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3">Platform</th>
                                <th className="px-6 py-3">Prompt</th>
                                <th className="px-6 py-3">Visible?</th>
                                <th className="px-6 py-3">Competitors Found</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {responses.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 text-slate-500 font-medium">
                                        {r.platform}
                                    </td>
                                    <td className="px-6 py-3 text-slate-900 max-w-xs truncate" title={r.prompt}>
                                        {r.prompt}
                                    </td>
                                    <td className="px-6 py-3">
                                        {r.analysis.mentioned ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                                                No
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 text-xs">
                                        {r.analysis.competitors_mentioned?.length > 0
                                            ? r.analysis.competitors_mentioned.join(', ')
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
