import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CoaraApi } from '../lib/coaraApi';
import { Spinner, Target, CaretRight } from '@phosphor-icons/react';

const IntentPrediction = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const handlePredict = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const data = await CoaraApi.classifyIntent(query);
            setResult(data);
            setHistory(prev => [
                { query, intent: data.intent, confidence: data.confidence },
                ...prev.slice(0, 4)
            ]);
        } catch (error) {
            alert('Failed to analyze intent. Ensure the backend is running on port 3001.');
        } finally {
            setLoading(false);
        }
    };

    const getIntentColor = (intent) => {
        switch (intent) {
            case 'learn': return 'blue';
            case 'compare': return 'indigo';
            case 'decide': return 'purple';
            case 'buy': return 'green';
            default: return 'slate';
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Intent Prediction Engine</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Predict User Journey & Buying Readiness</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Input Area */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Analyze User Prompt</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                                placeholder="e.g. 'What is the best CRM for small startups?'"
                                className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <button
                                onClick={handlePredict}
                                disabled={loading || !query}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                            >
                                {loading ? <Spinner className="animate-spin text-white" size={20} /> : <Target size={20} />}
                                Predict
                            </button>
                        </div>
                    </div>

                    {/* Result Area */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-2 h-full bg-${getIntentColor(result.intent)}-500`}></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Detected Intent</h3>
                                    <p className={`text-4xl font-black mt-2 capitalize text-${getIntentColor(result.intent)}-600`}>
                                        {result.intent}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Confidence</h3>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                        {(result.confidence * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Buying Stage</p>
                                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-100 capitalize">{result.buying_stage}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Recommended Action</p>
                                    <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400 capitalize">
                                        {result.marketing_action || (result.intent === 'buy' ? 'Trigger Conversion' : 'Nurture')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Funnel Viz (Static for now, but contextual) */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Global Intent Metrics (Session)</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Learn', val: 45, color: 'blue' },
                                { label: 'Compare', val: 30, color: 'indigo' },
                                { label: 'Decide', val: 15, color: 'purple' },
                                { label: 'Buy', val: 10, color: 'green' }
                            ].map((stage) => (
                                <div key={stage.label} className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-${stage.color}-600 bg-${stage.color}-200`}>
                                            {stage.label}
                                        </div>
                                        {/* Mock stats for now */}
                                        <div className={`text-xs font-semibold inline-block text-${stage.color}-600`}>
                                            {stage.val}%
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100 dark:bg-slate-800">
                                        <div style={{ width: `${stage.val}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${stage.color}-500`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Predicted Next Prompts & History */}
                <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-4">Predicted Next User Search</h2>
                        {result && result.next_queries ? (
                            <ul className="space-y-3">
                                {result.next_queries.map((q, i) => (
                                    <li key={i} className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border-l-4 border-indigo-500 text-sm text-slate-700 dark:text-slate-300 transform transition hover:scale-105 cursor-pointer">
                                        "{q}"
                                        <span className="block text-xs text-slate-400 mt-1">Probability: High</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Enter a query to see AI predictions for the next step in the user journey.</p>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-4">Assessment History</h2>
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">No prompts analyzed yet.</p>
                            ) : history.map((h, i) => (
                                <div key={i} className="flex gap-3 text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                                    <CaretRight className="mt-1 text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">"{h.query}"</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">{h.intent}</span>
                                            <span className="text-[10px] text-slate-400">{(h.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntentPrediction;
