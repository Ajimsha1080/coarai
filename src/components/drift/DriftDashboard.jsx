import React, { useState, useRef } from 'react';
import {
    Wind, Play, ArrowsClockwise, CheckCircle, Warning, XCircle,
    TrendUp, TrendDown, Minus, Lightning, Target
} from '@phosphor-icons/react';
import { resilientGeminiCall } from '../../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

// --- UTILITIES ---

const DEFAULT_PROMPTS = (brand, industry) => [
    `What are the top brands in the ${industry} space?`,
    `Who is the best ${industry} provider for small businesses?`,
    `Compare the pros and cons of ${brand} vs competitors.`,
    `What are the most popular ${industry} solutions in 2025?`,
    `Which ${industry} brand has the best customer support?`
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function DriftDashboard({ apiKey, onRequireApiKey }) {
    // --- STATE ---
    const [config, setConfig] = useState({
        brand: '',
        industry: '',
        competitors: '',
        prompts: []
    });
    const [step, setStep] = useState(1);
    const [isConfiguring, setIsConfiguring] = useState(true);

    const [baselineScan, setBaselineScan] = useState(null);
    const [comparisonScan, setComparisonScan] = useState(null);
    const [driftResults, setDriftResults] = useState(null);
    const [viewRaw, setViewRaw] = useState(null); // Content to show in modal

    const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0, status: '' });
    const abortControllerRef = useRef(null);

    // --- LOGIC: ANALYZE HELPERS ---
    const extractSignals = (text, brand, competitors) => {
        const lowerText = text.toLowerCase();
        const lowerBrand = brand.toLowerCase();

        // 1. Presence
        const hasBrand = lowerText.includes(lowerBrand);

        // 2. Position/Ranking (Heuristic)
        // If brand appears in first 20% of text or first 2 sentences, high score.
        let positionScore = 0;
        if (hasBrand) {
            const index = lowerText.indexOf(lowerBrand);
            if (index < 50) positionScore = 10;
            else if (index < 200) positionScore = 8;
            else if (index < 500) positionScore = 5;
            else positionScore = 3;
        }

        // 3. Competitors Found
        const competitorsFound = competitors.split(',').map(c => c.trim()).filter(c => c && lowerText.includes(c.toLowerCase()));

        // 4. Sentiment (Simple keyword heuristic for MVP)
        let sentiment = 'neutral';
        if (hasBrand) {
            const contextWindow = text.substring(Math.max(0, lowerText.indexOf(lowerBrand) - 50), Math.min(text.length, lowerText.indexOf(lowerBrand) + 150)).toLowerCase();
            if (contextWindow.includes('best') || contextWindow.includes('top') || contextWindow.includes('excellent') || contextWindow.includes('leader')) sentiment = 'positive';
            if (contextWindow.includes('bad') || contextWindow.includes('avoid') || contextWindow.includes('slow') || contextWindow.includes('expensive')) sentiment = 'negative';
        }

        return { hasBrand, positionScore, competitorsFound, sentiment, rawText: text };
    };

    const runPrompts = async (promptsToRun, brand, competitors) => {
        const results = [];
        let completed = 0;
        setCurrentProgress({ current: 0, total: promptsToRun.length, status: 'Starting scan...' });

        for (const prompt of promptsToRun) {
            if (abortControllerRef.current?.signal.aborted) break;

            setCurrentProgress({ current: completed + 1, total: promptsToRun.length, status: 'Running prompt...' });

            try {
                // Rate limit handling (naive)
                if (completed > 0) await sleep(800);

                const payload = {
                    contents: [{ parts: [{ text: prompt }] }]
                };

                const response = await resilientGeminiCall(apiKey, payload);
                const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response text";

                const signals = extractSignals(text, brand, competitors);
                results.push({ prompt, ...signals, model: response.usedModel || 'Unknown' });

            } catch (error) {
                console.error("Prompt failed:", error);
                results.push({
                    prompt,
                    hasBrand: false,
                    positionScore: 0,
                    competitorsFound: [],
                    sentiment: 'error',
                    rawText: error.message || "API Error"
                });
            }
            completed++;
        }
        return results;
    };

    // --- HANDLERS ---
    const handleStartBaseline = async () => {
        if (!config.brand || !config.industry) return alert("Please enter brand and industry");
        if (!apiKey) return onRequireApiKey();

        setIsConfiguring(false);
        setStep(2); // Loading State

        // Generate Prompts if empty
        const effectivePrompts = config.prompts.length > 0 ? config.prompts : DEFAULT_PROMPTS(config.brand, config.industry);
        setConfig(prev => ({ ...prev, prompts: effectivePrompts }));

        abortControllerRef.current = new AbortController();
        const results = await runPrompts(effectivePrompts, config.brand, config.competitors);

        setBaselineScan(results);
        setStep(3); // Baseline Done
    };

    const handleRunComparison = async () => {
        if (!baselineScan) return;
        setStep(4); // Loading Comparison

        abortControllerRef.current = new AbortController();
        const results = await runPrompts(config.prompts, config.brand, config.competitors);

        setComparisonScan(results);

        // Analyze Drift
        const drift = compareScans(baselineScan, results);
        setDriftResults(drift);
        setStep(5); // Results
    };

    const handleReset = () => {
        setStep(1);
        setIsConfiguring(true);
        setBaselineScan(null);
        setComparisonScan(null);
        setDriftResults(null);
    };

    // --- RENDER HELPERS ---
    const StatusBadge = ({ status, icon }) => {
        const colors = {
            'STABLE': 'bg-slate-100 text-slate-600',
            'INVISIBLE': 'bg-slate-200 text-slate-500', // Greyed out
            'ERROR': 'bg-red-50 text-red-600',
            'GAINED': 'bg-green-100 text-green-700',
            'IMPROVED': 'bg-green-100 text-green-700',
            'SENTIMENT+': 'bg-green-100 text-green-700',
            'LOST': 'bg-red-100 text-red-700',
            'DROPPED': 'bg-amber-100 text-amber-700',
            'CRASH': 'bg-red-100 text-red-700',
            'REPLACED': 'bg-red-100 text-red-700',
            'COMPETITION': 'bg-yellow-100 text-yellow-800',
        };

        const IconMap = {
            'neutral': Minus,
            'gain': TrendUp,
            'loss': TrendDown,
            'warning': Warning
        };

        const IconComp = IconMap[icon] || Minus;
        const colorClass = colors[status] || colors['STABLE'];

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colorClass}`}>
                <IconComp weight="bold" />
                {status}
            </span>
        );
    };

    const ResultCell = ({ data }) => {
        const isError = data.sentiment === 'error';
        const notFound = !data.hasBrand && !isError;

        return (
            <div className="flex flex-col items-start gap-1">
                {isError ? (
                    <span className="text-red-500 text-sm flex items-center gap-1 font-bold">
                        <Warning size={14} weight="fill" /> API Error
                    </span>
                ) : notFound ? (
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                        <XCircle size={14} /> Not Found
                    </span>
                ) : (
                    <div className="text-sm">
                        <span className="text-green-700 font-bold flex items-center gap-1">
                            <CheckCircle size={14} weight="fill" /> Found
                        </span>
                        <span className="text-xs text-slate-500 block">
                            Pos Score: {data.positionScore}
                        </span>
                        <span className="text-xs text-slate-500 block capitalize">
                            Sent: {data.sentiment}
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setViewRaw({ prompt: data.prompt, text: data.rawText })}
                    className="text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-600 tracking-wider flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 transition-colors"
                >
                    View Output
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">

            {/* RAW DATA MODAL */}
            <AnimatePresence>
                {viewRaw && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setViewRaw(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col relative z-50"
                        >
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-900 truncate pr-4">Response: {viewRaw.prompt}</h3>
                                <button onClick={() => setViewRaw(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><XCircle size={24} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto font-mono text-sm text-slate-600 whitespace-pre-wrap">
                                <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Generated by: {viewRaw.model || 'Unknown Model'}
                                </div>
                                {viewRaw.text}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                        <Wind className="text-indigo-500" weight="fill" />
                        Prompt Drift Monitor
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Detect stability issues in your brand's AI visibility. Run session-based comparison scans to see if your ranking flips, drops, or drifts over time.
                    </p>
                </div>
                {step > 1 && (
                    <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-slate-800 hover:underline">
                        Start New Session
                    </button>
                )}
            </div>

            {/* Config Panel */}
            {isConfiguring && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Target className="text-indigo-500" size={24} />
                        Session Configuration
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">My Brand Name</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Acme Corp"
                                value={config.brand}
                                onChange={e => setConfig({ ...config, brand: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Industry / Topic</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Email Marketing"
                                value={config.industry}
                                onChange={e => setConfig({ ...config, industry: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Competitors (Comma separated)</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Mailchimp, HubSpot, SendGrid"
                            value={config.competitors}
                            onChange={e => setConfig({ ...config, competitors: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleStartBaseline}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            <Play weight="bold" />
                            Run Baseline Scan
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Progress Indicator */}
            {(step === 2 || step === 4) && (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{currentProgress.status}</h3>
                    <p className="text-slate-500">
                        Processing prompt {currentProgress.current} of {currentProgress.total}...
                    </p>
                    <div className="mt-6 w-64 mx-auto bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Baseline Ready */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                        <CheckCircle size={32} weight="fill" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Baseline Scan Complete</h2>
                    <p className="text-slate-600 max-w-lg mx-auto mb-8">
                        We've captured the initial state of your brand across {baselineScan.length} prompts.
                        Now, run a comparison scan to check for stability or drift.
                    </p>

                    <button
                        onClick={handleRunComparison}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-3 text-lg transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1 active:scale-95"
                    >
                        <ArrowsClockwise weight="bold" size={24} />
                        Run Comparison Scan
                    </button>
                    <p className="mt-4 text-xs text-slate-400">
                        (This re-runs prompts with a delay to verify stability)
                    </p>
                </motion.div>
            )}

            {/* Step 5: Results Dashboard */}
            {step === 5 && driftResults && (
                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <Warning className="text-amber-600 mt-0.5" size={20} weight="fill" />
                        <div>
                            <h4 className="font-bold text-amber-900 text-sm">Session Data Only</h4>
                            <p className="text-amber-800 text-xs mt-1">
                                These results are generated in real-time and are not saved to a database.
                                Refreshing the page will lose this comparison data.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Drift Analysis Results</h3>
                            <button
                                onClick={handleRunComparison}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <ArrowsClockwise weight="bold" />
                                Re-run Details
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-1/3">Prompt</th>
                                        <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Baseline</th>
                                        <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Comparison</th>
                                        <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Diff / Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {driftResults.map((res, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-medium text-slate-900 text-sm">{res.prompt}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <ResultCell data={res.baseline} />
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <ResultCell data={res.comparison} />
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col gap-2 items-start">
                                                    <StatusBadge status={res.status} icon={res.icon} />
                                                    <ul className="text-xs text-slate-500 list-disc list-inside">
                                                        {res.details.map((d, i) => (
                                                            <li key={i}>{d}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
