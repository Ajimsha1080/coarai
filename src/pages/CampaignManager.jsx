import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CoaraApi } from '../lib/coaraApi';
import { Spinner, Robot, CaretUp, CheckCircle } from '@phosphor-icons/react';

const CampaignManager = () => {
    const [autopilot, setAutopilot] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [budget, setBudget] = useState(5000);
    const [logs, setLogs] = useState([
        { action: 'Bid Adjustment', detail: 'Increased bid for "best CRM 2024" on Gemini pro.', time: '2 mins ago', color: 'blue' },
        { action: 'Prompt Drift Detected', detail: 'Competitor "Salesforce" gaining ground in "enterprise" queries.', time: '15 mins ago', color: 'purple' },
        { action: 'Optimization', detail: 'Updated brand twin tone to be more "direct".', time: '1 hour ago', color: 'green' }
    ]);

    const handleRunAutopilot = async () => {
        setOptimizing(true);
        try {
            const res = await CoaraApi.runAutopilot({ campaign_id: 'demo', action: 'optimize' });

            // Add new logs from response
            const newLogs = res.optimizations.map(opt => ({
                action: opt.type === 'bid_adjustment' ? 'Bid Auto-Correction' : 'Content Refinement',
                detail: opt.detail,
                time: 'Just now',
                color: opt.type === 'bid_adjustment' ? 'blue' : 'green'
            }));

            setLogs([...newLogs, ...logs]);
        } catch (error) {
            alert('Autopilot failed to run. Check backend.');
        } finally {
            setOptimizing(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Autonomous Campaign Manager</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">AI-Driven Optimization & Budget Allocation</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Autopilot Mode</span>
                    <button
                        onClick={() => setAutopilot(!autopilot)}
                        className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${autopilot ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${autopilot ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Configuration Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Campaign Parameters</h2>
                        <button
                            onClick={handleRunAutopilot}
                            disabled={optimizing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {optimizing ? <Spinner className="animate-spin" /> : <Robot weight="bold" />}
                            Run Optimization Now
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Monthly Budget</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full pl-8 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Target Goal</label>
                            <select className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                <option>Maximize Visibility (Brand Awareness)</option>
                                <option>Maximize Leads (Conversion)</option>
                                <option>Balanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-xs uppercase font-bold text-slate-500 mb-4">Risk Tolerance</label>
                        <div className="flex gap-4">
                            {['Safe', 'Balanced', 'Aggressive'].map((mode) => (
                                <button key={mode} className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${mode === 'Balanced' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">*Balanced mode optimizes for visibility while strictly adhering to compliance rules.</p>
                    </div>
                </div>

                {/* AI Actions Feed */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-full flex flex-col">
                    <h2 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center justify-between">
                        Live AI Actions
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </h2>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-grow">
                        {logs.map((log, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3 text-sm"
                            >
                                <div className={`mt-1 min-w-[6px] h-1.5 rounded-full bg-${log.color}-500`}></div>
                                <div>
                                    <p className="text-slate-800 dark:text-slate-200 font-medium">{log.action}</p>
                                    <p className="text-slate-500 text-xs">{log.detail}</p>
                                    <span className="text-[10px] text-slate-400">{log.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignManager;
