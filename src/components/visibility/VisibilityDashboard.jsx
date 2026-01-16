
import React, { useState } from 'react';
import {
    Play, CheckCircle, XCircle, Warning, CaretDown, CaretUp,
    Plus, Trash, Globe, Eye, Lightning, ArrowCounterClockwise,
    Buildings, FileText, Target
} from '@phosphor-icons/react';
import { runVisibilityScan } from '../../lib/promptVisibilityService';
import { AVAILABLE_PLATFORMS } from '../../lib/ai-adapters';
import { motion, AnimatePresence } from 'framer-motion';

export default function VisibilityDashboard({ apiKey, onRequireApiKey }) {
    const [config, setConfig] = useState({
        brand: '',
        synonyms: '',
        prompts: ['', '', ''],
        models: ['gemini', 'openai-style'] // Default selection
    });

    const [status, setStatus] = useState('idle'); // idle, running, complete, error
    const [results, setResults] = useState(null);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    const handlePromptChange = (idx, val) => {
        const newPrompts = [...config.prompts];
        newPrompts[idx] = val;
        setConfig({ ...config, prompts: newPrompts });
    };

    const toggleModel = (id) => {
        const newModels = config.models.includes(id)
            ? config.models.filter(m => m !== id)
            : [...config.models, id];
        setConfig({ ...config, models: newModels });
    };

    const handleRun = async () => {
        if (!apiKey) return onRequireApiKey();

        // Validation
        const activePrompts = config.prompts.filter(p => p.trim().length > 0);
        if (!config.brand) return alert("Please enter a Brand Name.");
        if (activePrompts.length === 0) return alert("Please enter at least one prompt.");
        if (config.models.length === 0) return alert("Select at least one AI model.");

        const synonymsList = config.synonyms.split(',').map(s => s.trim()).filter(s => s);

        setStatus('running');
        setLoadingMsg('Initializing AI Agents...');
        setResults(null);

        try {
            // Simulated progress steps could be added here if we had an event emitter
            setLoadingMsg(`Scanning ${config.models.length} models for ${activePrompts.length} prompts...`);

            const scanData = await runVisibilityScan({
                brand: config.brand,
                synonyms: synonymsList,
                prompts: activePrompts,
                models: config.models,
                apiKey
            });

            setResults(scanData);
            setStatus('complete');
        } catch (err) {
            console.error(err);
            alert("Scan failed: " + err.message);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">

            {/* Header */}
            <header className="mb-12 text-center relative">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
                        AI Mindshare Analysis
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight text-slate-900">
                        Brand <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Visibility Tracker</span>
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Check if your brand is recommended across ChatGPT, Gemini, Claude, and Perplexity when potential customers ask specific questions.
                    </p>
                </motion.div>
            </header>

            {/* Config Panel */}
            {status !== 'complete' && (
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                        >
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Buildings className="text-violet-500" size={20} /> Brand Details
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Brand Name *</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                        placeholder="e.g. Asana"
                                        value={config.brand}
                                        onChange={e => setConfig({ ...config, brand: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">The main entity name to search for.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Aliases (Optional)</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                        placeholder="e.g. Asana Inc, Asana.com"
                                        value={config.synonyms}
                                        onChange={e => setConfig({ ...config, synonyms: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Comma separated variations.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                        >
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Target className="text-violet-500" size={20} /> Target Models
                            </h3>
                            <div className="space-y-2">
                                {AVAILABLE_PLATFORMS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => toggleModel(p.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${config.models.includes(p.id)
                                            ? 'border-violet-500 bg-violet-50 text-violet-900'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">
                                            {p.name}
                                        </span>
                                        {config.models.includes(p.id) && <CheckCircle weight="fill" className="text-violet-500" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Prompts & Run */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <FileText className="text-violet-500" size={20} /> Visibility Prompts
                                </h3>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Max 3</span>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                {config.prompts.map((p, i) => (
                                    <div key={i} className="relative">
                                        <span className="absolute left-4 top-3.5 text-xs font-bold text-slate-400">Q{i + 1}</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-100 hover:border-violet-300 transition-all text-sm"
                                            placeholder={i === 0 ? "Who is the best project management tool?" : "Enter another question..."}
                                            value={p}
                                            onChange={e => handlePromptChange(i, e.target.value)}
                                            maxLength={250}
                                        />
                                        <div className="text-right text-[10px] text-slate-300 mt-1">{p.length}/250</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleRun}
                                disabled={status === 'running'}
                                className="w-full py-4 bg-slate-900 hover:bg-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-wait mt-auto"
                            >
                                {status === 'running' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {loadingMsg}
                                    </>
                                ) : (
                                    <>
                                        <span>Run Visibility Scan</span>
                                        <Lightning weight="fill" className="text-yellow-400" />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {results && status === 'complete' && (
                <div className="animate-fade-in space-y-8">

                    {/* Score Card */}
                    <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="relative z-10">
                            <h2 className="text-indigo-200 font-medium text-sm uppercase tracking-widest mb-2">Overall Visibility Score</h2>
                            <div className="text-7xl font-display font-bold text-white mb-2">
                                {results.overallScore}%
                            </div>
                            <p className="text-indigo-300 text-sm">
                                Your brand was found in {results.results.filter(r => r.status === 'PRESENT').length} out of {results.results.length} total AI responses.
                            </p>
                        </div>

                        {/* Mini breakdown */}
                        <div className="flex gap-4 relative z-10">
                            {config.models.map(m => {
                                const modelResults = results.results.filter(r => r.modelId === m);
                                const foundCount = modelResults.filter(r => r.status === 'PRESENT').length;
                                const total = modelResults.length;
                                return (
                                    <div key={m} className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
                                        <div className="text-xs text-indigo-200 mb-1 truncate max-w-[80px] mx-auto opacity-70">
                                            {AVAILABLE_PLATFORMS.find(p => p.id === m)?.name.replace(' Style', '').replace(' (Recommended)', '')}
                                        </div>
                                        <div className="font-bold text-xl">{foundCount}/{total}</div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    {/* Detailed Rows */}
                    <div className="grid gap-6">
                        {/* Group results by Prompt */}
                        {config.prompts.filter(p => p.trim()).map((promptText, idx) => {
                            const promptResults = results.results.filter(r => r.prompt === promptText);
                            const visibility = Math.round((promptResults.filter(r => r.status === 'PRESENT').length / promptResults.length) * 100);
                            const isExpanded = expandedRow === idx;

                            return (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                                    <div
                                        className="p-6 cursor-pointer flex items-center justify-between gap-4"
                                        onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompt {idx + 1}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${visibility > 50 ? 'bg-green-100 text-green-700' : visibility > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                                                    {visibility}% Visibility
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-lg">{promptText}</h3>
                                        </div>

                                        {/* Model Badges */}
                                        <div className="flex items-center gap-2">
                                            {promptResults.map((r, i) => (
                                                <div
                                                    key={i}
                                                    title={`${r.modelName}: ${r.status}`}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${r.status === 'PRESENT' ? 'bg-green-50 border-green-200 text-green-600' :
                                                        r.status === 'ERROR' ? 'bg-slate-100 border-slate-200 text-slate-400' :
                                                            'bg-red-50 border-red-100 text-red-400'
                                                        }`}
                                                >
                                                    {r.status === 'PRESENT' ? <CheckCircle weight="fill" /> : r.status === 'ERROR' ? <Warning weight="fill" /> : <XCircle weight="fill" />}
                                                </div>
                                            ))}
                                            <div className="ml-4 text-slate-400">
                                                {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden bg-slate-50 border-t border-slate-100"
                                            >
                                                <div className="p-6 grid gap-4">
                                                    {promptResults.map((r, i) => (
                                                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-bold text-sm text-slate-800">{r.modelName}</div>
                                                                    {r.status === 'PRESENT' ? (
                                                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">Found</span>
                                                                    ) : (
                                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Absent</span>
                                                                    )}
                                                                </div>
                                                                {r.position !== 'absent' && (
                                                                    <span className="text-[10px] text-slate-400 uppercase">
                                                                        Mentioned {r.position} ({r.count}x)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                                                                {r.response}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => {
                                setStatus('idle');
                                setResults(null);
                            }}
                            className="text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <ArrowCounterClockwise size={18} />
                            Start New Scan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
