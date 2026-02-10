import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { CoaraApi } from '../lib/coaraApi';
import { Spinner, ArrowClockwise, MagnifyingGlass, ChartLineUp, Warning } from '@phosphor-icons/react';

const InfluenceScore = () => {
    const [brandName, setBrandName] = useState('');
    const [industry, setIndustry] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleScan = async (e) => {
        e.preventDefault();
        if (!brandName || !industry) return;

        setLoading(true);
        setError('');
        setScanResult(null);

        try {
            // Check if getInfluenceScore supports params, if not we need to update api lib or pass query string manually
            // Assuming CoaraApi.getInfluenceScore is flexible or we call fetch directly to be safe as we just updated backend
            const query = new URLSearchParams({ brandName, industry, brand_id: 'temp-id' }).toString();
            const res = await fetch(`http://localhost:3001/api/intelligence/score?${query}`).then(r => {
                if (!r.ok) throw new Error('Analysis failed');
                return r.json();
            });

            if (res.api_error) {
                setError(`AI Service Warning: ${res.api_error}. Showing default baseline.`);
            }

            const breakdown = res.breakdown;

            // Calculate stats
            const entries = Object.entries(breakdown);
            const sorted = entries.sort((a, b) => b[1] - a[1]);
            const best = sorted[0];
            const worst = sorted[sorted.length - 1];

            setScanResult({
                overallScore: res.overall_score || 0,
                chartData: [
                    { name: 'GPT-4', visibility: breakdown.gpt4 },
                    { name: 'Gemini', visibility: breakdown.gemini },
                    { name: 'Claude', visibility: breakdown.claude },
                    { name: 'Perplexity', visibility: breakdown.perplexity },
                ],
                bestModel: { name: best[0], score: best[1] },
                worstModel: { name: worst[0], score: worst[1] },
                competitors: res.top_competitors || []
            });

        } catch (err) {
            console.error(err);
            setError('Failed to analyze brand. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Influence Score Engine</h1>
                <p className="text-slate-600 dark:text-slate-400">Real-time visibility tracking across major LLMs</p>
            </motion.div>

            {/* Input Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
                        <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="e.g. Nike"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry / Category</label>
                        <input
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="e.g. Athletic Footwear"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !brandName || !industry}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner className="animate-spin w-5 h-5" /> : <magnifyingGlass className="w-5 h-5" />}
                        {loading ? 'Analyzing...' : 'Scan Visibility'}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            {scanResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><ChartLineUp size={64} /></div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase">Global Score</h3>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{scanResult.overallScore}</span>
                                <span className="text-slate-400">/100</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase">Strongest Channel</h3>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 capitalize">{scanResult.bestModel.name}</p>
                            <p className="text-green-500 text-sm mt-1">{scanResult.bestModel.score}% Visibility</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase">Weakest Link</h3>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 capitalize">{scanResult.worstModel.name}</p>
                            <p className="text-red-500 text-sm mt-1">{scanResult.worstModel.score}% Visibility</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Main Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Model Visibility Breakdown</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={scanResult.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="visibility" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Competitor / Insight Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Market Context</h2>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Top Competitors Found</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {scanResult.competitors && scanResult.competitors.length > 0 ? (
                                            scanResult.competitors.map((comp, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-300">
                                                    {comp}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400">None detected in top rankings</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <div className="flex gap-2">
                                        <Warning className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Optimization Insight</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                {scanResult.overallScore < 50
                                                    ? `Your brand visibility is low in the ${industry} category. AI models are favoring competitors. Recommended: specific content injection campaigns.`
                                                    : `Strong presence detected. Focus on maintaining dominance against emerging competitors like ${scanResult.competitors[0] || 'others'}.`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default InfluenceScore;
