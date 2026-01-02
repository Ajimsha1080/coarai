import React, { useState } from 'react';
import { generateDriftPrompts, promptRunner, analyzeMentions, compareRuns } from '../../lib/drift-monitor/logic';
import { Play, Repeat, ArrowRight, Warning, CheckCircle, Question, TrendUp, TrendDown, Minus } from '@phosphor-icons/react';

export default function DriftDashboard({ apiKey, onRequireApiKey }) {
    // Config State
    const [config, setConfig] = useState({
        brandName: '',
        industry: '',
        competitors: ''
    });

    // Phase State
    const [phase, setPhase] = useState('CONFIG'); // CONFIG, RUNNING_BASELINE, ANALYZING_BASELINE, BASELINE_DONE, RUNNING_COMPARISON, ANALYZING_COMPARISON, COMPARISON_DONE
    const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });

    // Data State
    const [prompts, setPrompts] = useState([]);
    const [baselineResults, setBaselineResults] = useState([]);
    const [comparisonResults, setComparisonResults] = useState([]);
    const [driftReport, setDriftReport] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const startBaseline = async () => {
        if (!apiKey) { onRequireApiKey(); return; }
        if (!config.brandName || !config.industry) { alert("Brand Name and Industry are required."); return; }

        // 1. Generate Prompts
        const generatedPrompts = generateDriftPrompts({
            brandName: config.brandName,
            industry: config.industry,
            category: config.industry, // Simplified mapping
            competitors: config.competitors.split(',').map(s => s.trim()).filter(Boolean)
        });
        setPrompts(generatedPrompts);

        // 2. Run Baseline
        setPhase('RUNNING_BASELINE');
        setProgress({ current: 0, total: generatedPrompts.length, message: 'Fetching AI Responses...' });

        const rawResults = await promptRunner(generatedPrompts, apiKey, (c, t) => {
            setProgress({ current: c, total: t, message: `Running Prompt ${c}/${t}` });
        });

        // 3. Analyze Baseline
        setPhase('ANALYZING_BASELINE');
        setProgress({ current: 0, total: generatedPrompts.length, message: 'Analyzing Mentions...' });

        const competitorsList = config.competitors.split(',').map(s => s.trim()).filter(B => B);
        const analyzedResults = await analyzeMentions(rawResults, apiKey, config.brandName, competitorsList, (c, t) => {
            setProgress({ current: c, total: t, message: `Analyzing ${c}/${t}` });
        });

        setBaselineResults(analyzedResults);
        setPhase('BASELINE_DONE');
    };

    const runComparison = async () => {
        // 1. Run Comparison (Same Prompts)
        setPhase('RUNNING_COMPARISON');
        setProgress({ current: 0, total: prompts.length, message: 'Fetching Comparison Responses...' });

        const rawResults = await promptRunner(prompts, apiKey, (c, t) => {
            setProgress({ current: c, total: t, message: `Running Prompt ${c}/${t}` });
        });

        // 2. Analyze Comparison
        setPhase('ANALYZING_COMPARISON');
        setProgress({ current: 0, total: prompts.length, message: 'Analyzing Comparison...' });

        const competitorsList = config.competitors.split(',').map(s => s.trim()).filter(B => B);
        const analyzedResults = await analyzeMentions(rawResults, apiKey, config.brandName, competitorsList, (c, t) => {
            setProgress({ current: c, total: t, message: `Analyzing ${c}/${t}` });
        });

        setComparisonResults(analyzedResults);

        // 3. Compute Drift
        const report = compareRuns(baselineResults, analyzedResults);
        setDriftReport(report);
        setPhase('COMPARISON_DONE');
    };

    const reset = () => {
        if (confirm("This will clear all in-memory results. Are you sure?")) {
            setPhase('CONFIG');
            setBaselineResults([]);
            setComparisonResults([]);
            setDriftReport([]);
            setPrompts([]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">

            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Prompt Drift <span className="text-violet-600">Monitor</span></h1>
                    <p className="text-slate-500 mt-2">Ephemeral session to detect AI response drift. No data is stored.</p>
                </div>
                <div className="flex gap-2">
                    {phase !== 'CONFIG' && (
                        <button onClick={reset} className="px-4 py-2 text-sm text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg hover:bg-red-50 transition-colors">
                            Reset Session
                        </button>
                    )}
                </div>
            </div>

            {/* Config Phase */}
            {phase === 'CONFIG' && (
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-indigo-900/5 border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Warning size={24} className="text-orange-500" /> Session Setup
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Brand Name</label>
                            <input name="brandName" value={config.brandName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-violet-500" placeholder="e.g. Acme Corp" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Industry / Topic</label>
                            <input name="industry" value={config.industry} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-violet-500" placeholder="e.g. Cloud Storage" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Competitors (Optional, comma separated)</label>
                            <input name="competitors" value={config.competitors} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-violet-500" placeholder="e.g. CompA, CompB" />
                        </div>
                        <div className="pt-4">
                            <button onClick={startBaseline} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-violet-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                <Play weight="fill" /> Start Baseline Run
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-3">Warning: Results will be lost if you refresh.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Runner Progress */}
            {['RUNNING_BASELINE', 'ANALYZING_BASELINE', 'RUNNING_COMPARISON', 'ANALYZING_COMPARISON'].includes(phase) && (
                <div className="max-w-md mx-auto text-center py-20">
                    <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{progress.message}</h3>
                    <p className="text-slate-500">Processing {progress.current} of {progress.total} prompts...</p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-6 overflow-hidden">
                        <div className="bg-violet-600 h-full transition-all duration-300" style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}></div>
                    </div>
                </div>
            )}

            {/* Results Phase */}
            {(phase === 'BASELINE_DONE' || phase === 'COMPARISON_DONE') && (
                <div className="space-y-8">
                    {/* Control Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${phase === 'BASELINE_DONE' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                                {phase === 'BASELINE_DONE' ? 'Baseline Captured' : 'Comparison Complete'}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span>{prompts.length} Prompts Tracked</span>
                        </div>
                        <div>
                            <button
                                onClick={runComparison}
                                disabled={prompts.length === 0}
                                className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-violet-700 transition-colors shadow-md flex items-center gap-2"
                            >
                                <Repeat weight="bold" />
                                {phase === 'BASELINE_DONE' ? 'Run Comparison Scan' : 'Re-Run Comparison'}
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="p-4 w-1/3">Prompt</th>
                                    <th className="p-4">Baseline Result</th>
                                    <th className="p-4">{phase === 'BASELINE_DONE' ? 'Comparison (Pending)' : 'Comparison Result'}</th>
                                    <th className="p-4 text-right">Drift Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {prompts.map((prompt, i) => {
                                    const base = baselineResults.find(r => r.id === prompt.id)?.analysis;
                                    const comp = comparisonResults.find(r => r.id === prompt.id)?.analysis;
                                    // Use drift report if available, else placeholders
                                    const drift = driftReport.find(d => d.id === prompt.id)?.drift;

                                    return (
                                        <tr key={prompt.id} className="hover:bg-slate-50/50">
                                            <td className="p-4 font-medium text-slate-700">{prompt.text}</td>

                                            {/* Baseline Cell */}
                                            <td className="p-4">
                                                {base ? (
                                                    <div className="flex flex-col gap-1">
                                                        <ResultBadge result={base} />
                                                        <span className="text-xs text-slate-400">Score: {base.prominence_score}/10</span>
                                                    </div>
                                                ) : <span className="text-slate-300">...</span>}
                                            </td>

                                            {/* Comparison Cell */}
                                            <td className="p-4">
                                                {phase === 'BASELINE_DONE' ? (
                                                    <span className="text-slate-300 italic">Waiting to run...</span>
                                                ) : comp ? (
                                                    <div className="flex flex-col gap-1">
                                                        <ResultBadge result={comp} />
                                                        <span className="text-xs text-slate-400">Score: {comp.prominence_score}/10</span>
                                                    </div>
                                                ) : <span className="text-red-400">Error</span>}
                                            </td>

                                            {/* Drift Status */}
                                            <td className="p-4 text-right">
                                                {phase === 'BASELINE_DONE' ? (
                                                    <span className="inline-block w-2 h-2 rounded-full bg-slate-200"></span>
                                                ) : drift ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <DriftBadge status={drift.status} color={drift.color} />
                                                        <span className="text-xs text-slate-500">{drift.changeDescription}</span>
                                                    </div>
                                                ) : null}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helpers
function ResultBadge({ result }) {
    if (!result.mentioned) return <span className="text-slate-400 font-medium">Not Mentioned</span>;
    return (
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <CheckCircle className="text-emerald-500" weight="fill" />
            Mentioned ({result.position || 'Listed'})
        </span>
    );
}

function DriftBadge({ status, color }) {
    const colors = {
        green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        orange: 'bg-amber-100 text-amber-700 border-amber-200',
        gray: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    let Icon = Minus;
    if (status === 'GAINED') Icon = TrendUp;
    if (status === 'LOST') Icon = TrendDown;
    if (status === 'SHIFTED') Icon = Warning;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[color] || colors.gray}`}>
            <Icon weight="bold" /> {status}
        </span>
    );
}
