import React, { useState, useRef } from 'react';
import {
    Wind, Play, ArrowsClockwise, CheckCircle, Warning, XCircle,
    TrendUp, TrendDown, Minus, Lightning, Target, Cpu, Plus, Trash
} from '@phosphor-icons/react';
import { getAdapter, AVAILABLE_PLATFORMS } from '../../lib/ai-adapters'; // Import Adapter Factory
import { motion, AnimatePresence } from 'framer-motion';

// --- UTILITIES ---

const GENERATE_SYSTEM_PROMPTS = (brand, productType) => [
    {
        text: `What are the top ${productType} brands, and where does ${brand} fit among them?`,
        intent: 'INDUSTRY_DISCOVERY'
    },
    {
        text: `Who is the best ${productType} provider, and is ${brand} considered a top contender?`,
        intent: 'INDUSTRY_DISCOVERY'
    },
    {
        text: `Compare ${brand} vs competitors in ${productType}.`,
        intent: 'COMPARISON'
    },
    {
        text: `Which ${productType} brands are popular today, including notable models like ${brand}?`,
        intent: 'INDUSTRY_DISCOVERY'
    },
    {
        text: `Which ${productType} brands or models, including ${brand}, are known for good customer support?`,
        intent: 'SUPPORT'
    }
];

const PRODUCT_CATEGORIES = [
    { label: "SaaS / Software", value: "SaaS / Software" },
    { label: "Mobile App", value: "Mobile App" },
    { label: "Website / Web Platform", value: "Website / Web Platform" },
    { label: "API / Developer Tool", value: "API / Developer Tool" },
    { label: "Smartphone", value: "Smartphone" },
    { label: "Laptop / Computer", value: "Laptop / Computer" },
    { label: "Wearable Device", value: "Wearable Device" },
    { label: "Packaged Food / Snacks", value: "Packaged Food / Snacks" },
    { label: "Beverage Product", value: "Beverage Product" },
    { label: "Personal Care Product", value: "Personal Care Product" },
    { label: "Marketplace", value: "Marketplace" },
    { label: "D2C Brand", value: "D2C Brand" },
    { label: "Payment Gateway", value: "Payment Gateway" },
    { label: "Banking / FinTech App", value: "Banking / FinTech App" },
    { label: "Investment Platform", value: "Investment Platform" },
    { label: "EdTech Platform", value: "EdTech Platform" },
    { label: "Online Course / Learning App", value: "Online Course / Learning App" },
    { label: "HealthTech Platform", value: "HealthTech Platform" },
    { label: "Medical Device", value: "Medical Device" },
    { label: "CRM Software", value: "CRM Software" },
    { label: "Email Marketing Tool", value: "Email Marketing Tool" },
    { label: "Analytics Tool", value: "Analytics Tool" },
    { label: "Other (Specify)", value: "Other" }
];



const categorizePrompt = (prompt, isCustom = false) => {
    if (isCustom) return 'Custom Prompt';
    const p = prompt.toLowerCase();
    if (p.includes('compare') || p.includes('vs') || p.includes('difference')) return 'Comparison';
    if (p.includes('buy') || p.includes('cost') || p.includes('price') || p.includes('cheap')) return 'Buying Intent';
    if (p.includes('support') || p.includes('help') || p.includes('trust') || p.includes('review')) return 'Support / Trust';
    return 'Industry Discovery';
};

const calculateStabilityScore = (results) => {
    if (!results) return 100;
    let score = 100;
    results.forEach(r => {
        if (r.status === 'DROPPED') score -= 20;
        if (r.status === 'SHIFTED') score -= 10;
        if (r.status === 'ABSENT') score -= 5;
    });
    return Math.max(0, score);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function DriftDashboard({ apiKey, onRequireApiKey }) {
    // --- STATE ---
    const [config, setConfig] = useState({
        brand: '',
        productType: '', // Selected value from dropdown
        otherProductType: '', // Value if 'Other' is selected
        industry: '', // Optional: Secondary context
        competitors: '',
        prompts: [],
        customPrompts: [], // Stores user-added custom prompts
        platform: 'gemini' // Default Platform
    });
    const [customInput, setCustomInput] = useState(''); // Temp input for custom prompt
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

        // 2. Mention Position (Heuristic)
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
        setCurrentProgress({ current: 0, total: promptsToRun.length, status: `Initializing ${config.platform} adapter...` });

        // Initialize Adapter
        const adapter = getAdapter(config.platform, apiKey);

        for (const item of promptsToRun) {
            // Handle both object (new) and string (legacy/fallback) formats
            const promptText = typeof item === 'string' ? item : item.text;
            const promptType = typeof item === 'string' ? 'SYSTEM' : item.type;

            if (abortControllerRef.current?.signal.aborted) break;

            setCurrentProgress({ current: completed + 1, total: promptsToRun.length, status: 'Running prompt...' });

            try {
                // Rate limit handling (naive)
                if (completed > 0) await sleep(800);

                // USE ADAPTER instead of direct call
                const response = await adapter.runPrompt(promptText);
                const text = response.text || "No response text";

                const signals = extractSignals(text, brand, competitors);
                results.push({
                    id: item.id,
                    prompt: promptText,
                    type: promptType,
                    tag: item.tag || 'GENERAL',
                    ...signals,
                    model: response.model || 'Unknown',
                    platform: response.platform || config.platform
                });

            } catch (error) {
                console.error("Prompt failed:", error);
                results.push({
                    prompt: promptText,
                    type: promptType,
                    hasBrand: false,
                    positionScore: 0,
                    competitorsFound: [],
                    sentiment: 'error',
                    rawText: error.message || "Adapter Error"
                });
            }
            completed++;
        }
        return results;
    };

    // --- LOGIC: COMPARE SCANS ---
    const compareScans = (base, comp) => {
        return base.map((b, idx) => {
            const c = comp[idx];
            if (!c) return null;

            let status = 'STABLE';
            let icon = 'neutral';
            let rationale = '';
            const details = [];

            const bFound = b.hasBrand;
            const cFound = c.hasBrand;

            if (bFound && !cFound) {
                status = 'DROPPED';
                icon = 'loss';
                rationale = 'Brand was present in baseline but disappeared in this session.';
            } else if (!bFound && cFound) {
                status = 'GAINED';
                icon = 'gain';
                rationale = 'Brand appeared in this session (previously absent).';
            } else if (!bFound && !cFound) {
                status = 'ABSENT';
                icon = 'neutral';
                rationale = 'Brand consistently absent from AI responses.';
            } else {
                // Both Found - Check for Shifts
                let isShifted = false;

                // Position Logic
                if (c.positionScore !== b.positionScore) {
                    isShifted = true;
                    const diff = c.positionScore - b.positionScore;
                    details.push(diff > 0 ? 'Position Improved' : 'Brand appeared later');
                }

                // Sentiment Logic
                if (c.sentiment !== b.sentiment) {
                    isShifted = true;
                    details.push(`Tone shifted: ${b.sentiment} -> ${c.sentiment}`);
                }

                if (isShifted) {
                    status = 'SHIFTED';
                    icon = 'warning';
                    rationale = 'AI changed the context or visibility of the brand.';
                } else {
                    status = 'STABLE';
                    icon = 'neutral';
                    rationale = 'Consistent visibility and tone.';
                }
            }

            // Competitor Analysis
            const newComps = c.competitorsFound.filter(x => !b.competitorsFound.includes(x));
            if (newComps.length > 0) {
                details.push(`New competitors: ${newComps.join(', ')}`);
            }

            if (c.sentiment === 'error') { status = 'ERROR'; icon = 'warning'; }

            return {
                prompt: b.prompt,
                baseline: b,
                comparison: c,
                status,
                icon,
                details,
                rationale,
                category: b.tag || categorizePrompt(b.prompt, b.type === 'CUSTOM')
            };
        });
    };

    // --- HANDLERS ---
    const handleStartBaseline = async () => {
        // 1. Strict Product Type Resolution
        let resolvedType = config.productType;
        if (resolvedType === 'Other') {
            resolvedType = config.otherProductType;
        }

        // 2. Validation
        if (!config.brand || !resolvedType || resolvedType.trim() === '') {
            return alert("Please specify a Product Type to run the analysis.");
        }
        if (resolvedType.length < 3) return alert("Product Type is too short. Please be specific.");
        const invalidTypes = ['food', 'tech', 'software', 'saas', 'technology', 'electronics'];
        if (invalidTypes.includes(resolvedType.toLowerCase())) return alert("Product Type is too broad. Please be specific (e.g. 'CRM Software' instead of 'Software').");

        if (!apiKey) return onRequireApiKey();

        setIsConfiguring(false);
        setStep(2); // Loading State

        // 3. Construct Session Prompts (Single Source of Truth)
        const systemPromptConfigs = GENERATE_SYSTEM_PROMPTS(config.brand, resolvedType);

        // Map system prompts to tags
        const systemPrompts = systemPromptConfigs.map((p, i) => ({
            id: `sys-${i + 1}`,
            text: p.text,
            type: 'SYSTEM',
            tag: p.intent
        }));

        const customPromptsMapped = config.customPrompts.map((text, i) => ({
            id: `custom-${i + 1}`,
            text: text,
            type: 'CUSTOM',
            tag: 'CUSTOM'
        }));

        const sessionPrompts = [...systemPrompts, ...customPromptsMapped];

        // Ensure we save the effective prompts to state so Comparison scan uses same logic
        setConfig(prev => ({ ...prev, prompts: sessionPrompts }));

        abortControllerRef.current = new AbortController();
        const results = await runPrompts(sessionPrompts, config.brand, config.competitors);

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
        // Reset Custom Prompts to enforce session limits
        setConfig(prev => ({ ...prev, customPrompts: [] }));
    };

    const handleAddCustomPrompt = () => {
        if (!customInput || customInput.trim().length < 10) return alert("Prompt must be at least 10 characters.");
        if (customInput.length > 400) return alert("Prompt is too long (max 400 characters). Long prompts increase analysis cost.");

        if (config.customPrompts.length >= 3) return; // Fail silently or handle with UI state (handled by button disable)

        setConfig({ ...config, customPrompts: [...config.customPrompts, customInput.trim()] });
        setCustomInput('');
    };

    const handleRemoveCustomPrompt = (index) => {
        const newPrompts = [...config.customPrompts];
        newPrompts.splice(index, 1);
        setConfig({ ...config, customPrompts: newPrompts });
    };

    // --- RENDER HELPERS ---
    const StatusBadge = ({ status, icon }) => {
        const colors = {
            'STABLE': 'bg-slate-100 text-slate-600',
            'ABSENT': 'bg-slate-200 text-slate-500',
            'GAINED': 'bg-green-100 text-green-700',
            'DROPPED': 'bg-red-100 text-red-700',
            'SHIFTED': 'bg-amber-100 text-amber-700',
            'ERROR': 'bg-red-50 text-red-600',
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
                        <div className="flex items-center gap-2 mt-1">
                            <span title="Represents the order in which the brand appears in the AI response. This is not a search ranking." className="text-xs text-slate-500 cursor-help border-b border-dotted border-slate-300">
                                Pos: {data.positionScore}/10
                            </span>
                            <span title="Reflects the tone of the brand mention in the AI response, not customer reviews." className="text-xs text-slate-500 cursor-help border-b border-dotted border-slate-300 capitalize">
                                {data.sentiment}
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setViewRaw({ prompt: data.prompt, text: data.rawText, model: data.model, platform: data.platform })}
                    className="text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-600 tracking-wider flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 transition-colors mt-1"
                >
                    View Output
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative" >

            {/* RAW DATA MODAL */}
            < AnimatePresence >
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
                                <div>
                                    <h3 className="font-bold text-slate-900 truncate pr-4">Response Detail</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">{viewRaw.platform}</span>
                                        <span className="text-xs text-slate-500">{viewRaw.model || 'Unknown Model'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setViewRaw(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><XCircle size={24} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto font-mono text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {viewRaw.text}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Header */}
            < div className="mb-8 flex justify-between items-end" >
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                        <Wind className="text-indigo-500" weight="fill" />
                        Prompt Drift Monitor
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Analyze stability of your brand's presence in AI responses. Run session-based comparison scans (Baseline vs New) to detect visibility gaps or sentiment shifts.
                    </p>
                </div>
                {
                    step > 1 && (
                        <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-slate-800 hover:underline">
                            Start New Session
                        </button>
                    )
                }
            </div >

            {/* Config Panel */}
            {
                isConfiguring && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Target className="text-indigo-500" size={24} />
                                Session Configuration
                            </h3>
                            <div className="bg-indigo-50 px-3 py-1 rounded text-xs text-indigo-700 font-medium">Session ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                        </div>

                        {/* Model Selector */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Cpu size={14} /> AI Platform Model
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {AVAILABLE_PLATFORMS.map((platform) => (
                                    <button
                                        key={platform.id}
                                        onClick={() => setConfig({ ...config, platform: platform.id })}
                                        className={`relative p-4 rounded-xl border text-left transition-all ${config.platform === platform.id
                                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="font-bold text-sm text-slate-900">{platform.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{platform.description}</div>
                                        {platform.badge && (
                                            <span className="absolute top-2 right-2 text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-100 text-slate-400">
                                                {platform.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                <Warning size={12} />
                                Drift detection is most accurate when using the same model for baseline and comparison.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">My Brand Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Acme Corp"
                                    value={config.brand}
                                    onChange={e => setConfig({ ...config, brand: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Product Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-2"
                                    value={config.productType}
                                    onChange={e => setConfig({ ...config, productType: e.target.value })}
                                >
                                    <option value="">Select Product Type...</option>
                                    <optgroup label="Software & Tech">
                                        <option value="SaaS / Software">SaaS / Software</option>
                                        <option value="Mobile App">Mobile App</option>
                                        <option value="Website / Web Platform">Website / Web Platform</option>
                                        <option value="API / Developer Tool">API / Developer Tool</option>
                                        <option value="CRM Software">CRM Software</option>
                                        <option value="Email Marketing Tool">Email Marketing Tool</option>
                                        <option value="Analytics Tool">Analytics Tool</option>
                                    </optgroup>
                                    <optgroup label="Consumer Electronics">
                                        <option value="Smartphone">Smartphone</option>
                                        <option value="Laptop / Computer">Laptop / Computer</option>
                                        <option value="Wearable Device">Wearable Device</option>
                                    </optgroup>
                                    <optgroup label="FMCG">
                                        <option value="Packaged Food / Snacks">Packaged Food / Snacks</option>
                                        <option value="Beverage Product">Beverage Product</option>
                                        <option value="Personal Care Product">Personal Care Product</option>
                                    </optgroup>
                                    <optgroup label="Finance & E-commerce">
                                        <option value="Marketplace">Marketplace</option>
                                        <option value="D2C Brand">D2C Brand</option>
                                        <option value="Payment Gateway">Payment Gateway</option>
                                        <option value="Banking / FinTech App">Banking / FinTech App</option>
                                        <option value="Investment Platform">Investment Platform</option>
                                    </optgroup>
                                    <optgroup label="Services & Health">
                                        <option value="EdTech Platform">EdTech Platform</option>
                                        <option value="Online Course / Learning App">Online Course / Learning App</option>
                                        <option value="HealthTech Platform">HealthTech Platform</option>
                                        <option value="Medical Device">Medical Device</option>
                                    </optgroup>
                                    <option value="Other">Other (Specify)</option>
                                </select>

                                {config.productType === 'Other' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Specific Product Type (e.g. Accounting Software)"
                                            value={config.otherProductType}
                                            onChange={e => setConfig({ ...config, otherProductType: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Be specific. Avoid generic terms like 'Tech' or 'Food'.</p>
                                    </motion.div>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">Select what your brand actually sells. This anchors the AI prompts.</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Industry / Vertical (Optional)</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. B2B Technology (Secondary Context)"
                                value={config.industry}
                                onChange={e => setConfig({ ...config, industry: e.target.value })}
                            />
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

                        {/* Custom Prompts Section */}
                        <div className="mb-8 bg-slate-50/50 p-4 rounded-xl border border-slate-200 border-dashed">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Plus size={14} className="text-indigo-500" />
                                    Add Custom Prompt (Optional)
                                </label>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${config.customPrompts.length >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {config.customPrompts.length}/3 used
                                </span>
                            </div>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={config.customPrompts.length >= 3 ? "Maximum custom prompts reached" : "e.g. How does [Brand] pricing compare for enterprise?"}
                                    value={customInput}
                                    onChange={e => setCustomInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddCustomPrompt()}
                                    disabled={config.customPrompts.length >= 3}
                                    maxLength={400}
                                />
                                <button
                                    onClick={handleAddCustomPrompt}
                                    disabled={!customInput || customInput.length < 10 || config.customPrompts.length >= 3}
                                    className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {config.customPrompts.length >= 3 ? 'Limit Reached' : 'Add'}
                                </button>
                            </div>

                            {customInput.length > 250 && (
                                <p className="text-[10px] text-amber-600 font-bold mb-2 flex items-center gap-1">
                                    <Warning size={12} weight="fill" />
                                    Long prompts may increase analysis cost ({customInput.length}/400 chars).
                                </p>
                            )}

                            {config.customPrompts.length >= 3 && (
                                <p className="text-[10px] text-amber-600 font-bold mb-2 flex items-center gap-1">
                                    <Warning size={12} weight="fill" />
                                    You’ve reached the maximum number of custom prompts for this session.
                                </p>
                            )}

                            {config.customPrompts.length > 0 && (
                                <div className="space-y-2">
                                    {config.customPrompts.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm bg-indigo-50 text-indigo-900 px-3 py-2 rounded-lg border border-indigo-100">
                                            <span className="truncate pr-4 font-medium">{p}</span>
                                            <button onClick={() => handleRemoveCustomPrompt(i)} className="text-indigo-400 hover:text-red-500 transition-colors">
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[10px] text-slate-400 mt-2">
                                Each custom prompt runs twice (baseline + comparison). Max 3 per session.
                            </p>
                        </div>

                        {/* Pre-run Preview */}
                        <div className="mb-8 border-t border-slate-100 pt-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Session Prompts Preview</h4>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
                                {config.productType ? (
                                    <>
                                        {GENERATE_SYSTEM_PROMPTS(config.brand || '[Brand]', config.productType === 'Other' ? (config.otherProductType || 'Other') : config.productType).map((p, i) => (
                                            <div key={`sys-${i}`} className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-1 rounded uppercase mt-0.5 min-w-[50px] text-center">System</span>
                                                <span className="italic">{p.text}</span>
                                            </div>
                                        ))}
                                        {config.customPrompts.map((p, i) => (
                                            <div key={`cus-${i}`} className="flex items-start gap-2 text-sm text-indigo-700 bg-indigo-50/50 p-1 rounded -mx-1">
                                                <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1 rounded uppercase mt-0.5 min-w-[50px] text-center">Custom</span>
                                                <span className="font-medium">{p}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-slate-400 text-sm italic">Select a Product Type to see generated prompts...</div>
                                )}
                            </div>
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
                )
            }

            {/* Progress Indicator */}
            {
                (step === 2 || step === 4) && (
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
                )
            }

            {/* Step 3: Baseline Ready (Session Locked) */}
            {
                step === 3 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                            <CheckCircle size={32} weight="fill" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Baseline Scan Complete</h2>
                        <p className="text-slate-600 max-w-lg mx-auto mb-2">
                            We've captured the initial state using <strong>{AVAILABLE_PLATFORMS.find(p => p.id === config.platform)?.name}</strong>.
                        </p>
                        <p className="text-xs text-slate-400 mb-8 max-w-md mx-auto">
                            Your session is now locked to this model to ensure scientifically accurate drift detection.
                        </p>

                        <button
                            onClick={handleRunComparison}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-3 text-lg transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1 active:scale-95"
                        >
                            <ArrowsClockwise weight="bold" size={24} />
                            Run Comparison Scan
                        </button>
                    </motion.div>
                )
            }

            {/* Step 5: Results Dashboard */}
            {
                step === 5 && driftResults && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs text-indigo-800">
                            <Lightning weight="fill" className="text-indigo-500" />
                            <strong>Note:</strong> System prompts are product-aware to test whether AI naturally includes your brand alongside others.
                        </div>

                        {/* Session Summary Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-1 border-r border-slate-100 pr-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Visibility Stability Score</h4>
                                <div className="flex items-end gap-3">
                                    <span className={`text-4xl font-bold ${calculateStabilityScore(driftResults) > 80 ? 'text-green-600' : calculateStabilityScore(driftResults) > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {calculateStabilityScore(driftResults)}
                                    </span>
                                    <span className="text-slate-400 font-medium pb-2 text-sm">/ 100</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 mb-3">
                                    Indicates how consistent AI visibility is during this session.
                                </p>
                                <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                                    Model: {AVAILABLE_PLATFORMS.find(p => p.id === config.platform)?.name} (Session)
                                </div>
                            </div>
                            <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-xs text-green-800 font-bold uppercase mb-1">Gained</div>
                                    <div className="text-2xl font-bold text-green-600">{driftResults.filter(r => r.status === 'GAINED').length}</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <div className="text-xs text-red-800 font-bold uppercase mb-1">Dropped</div>
                                    <div className="text-2xl font-bold text-red-600">{driftResults.filter(r => r.status === 'DROPPED').length}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <div className="text-xs text-slate-600 font-bold uppercase mb-1">Stable</div>
                                    <div className="text-2xl font-bold text-slate-700">{driftResults.filter(r => r.status === 'STABLE').length}</div>
                                </div>
                                <div className="p-3 bg-slate-100 rounded-lg opacity-75">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Absent</div>
                                    <div className="text-2xl font-bold text-slate-500">{driftResults.filter(r => r.status === 'ABSENT').length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800">Drift Analysis Results</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Prompts are generated using your Product Type ({config.productType === 'Other' ? config.otherProductType : config.productType}) to ensure relevant AI responses.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded">
                                        Model: {AVAILABLE_PLATFORMS.find(p => p.id === config.platform)?.name || config.platform}
                                    </span>
                                    <button
                                        onClick={handleRunComparison}
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <ArrowsClockwise weight="bold" />
                                        Re-run Comparison Scan
                                    </button>
                                </div>
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
                                                    <div className="font-medium text-slate-900 text-sm mb-1">{res.prompt}</div>
                                                    <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${res.category === 'Custom Prompt' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                        {res.category}
                                                    </span>
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
                                                        {res.rationale && (
                                                            <div className="text-[10px] text-slate-400 italic">
                                                                "{res.rationale}"
                                                            </div>
                                                        )}
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
                                {/* Disclaimer */}
                                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-400">
                                        Prompt Drift Monitor analyzes AI-generated responses. It does not measure search rankings or market share.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
