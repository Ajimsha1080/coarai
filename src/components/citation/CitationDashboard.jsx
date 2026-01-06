import React, { useState } from 'react';
import {
    Quotes, Trophy, Target, Warning, Lightning, CheckCircle,
    TrendUp, Bug, ArrowRight, BookOpen, ShieldCheck, XCircle, Minus,
    Robot, Cpu, Globe
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { resilientGeminiCall } from '../../lib/gemini';
import { analyzeCitationWithAI, calculateAuthorityScore } from '../../lib/citationEngine';

const DEFAULT_GEO_PROMPTS = (brand, industry) => [
    `Define ${brand} and its role in ${industry}.`,
    `What is the best ${industry} solution for enterprise?`,
    `According to ${brand}, what is the future of ${industry}?`,
    `Compare top ${industry} tools: ${brand} vs competitors.`,
    `How does ${brand} handle data security?`
];

const AI_MODELS = [
    { id: 'Gemini', name: 'Gemini', icon: SparkleIcon, description: 'Google DeepMind (Flash 2.5/Pro)' },
    { id: 'ChatGPT', name: 'ChatGPT', icon: Robot, description: 'OpenAI GPT-4 (Simulated)' },
    { id: 'Perplexity', name: 'Perplexity', icon: Globe, description: 'Perplexity AI (Citation-First)' }
];

// Helper icon for Gemini since it's not in Phosphor default set sometimes, or just use Lightning
function SparkleIcon(props) {
    return <Lightning {...props} />;
}

export default function CitationDashboard({ apiKey, onRequireApiKey }) {
    // State
    const [config, setConfig] = useState({ brand: '', industry: '', competitors: '' });
    const [selectedModels, setSelectedModels] = useState(['Gemini']);
    const [status, setStatus] = useState('idle'); // idle, running, complete
    const [results, setResults] = useState({}); // { 'Gemini': [...], 'ChatGPT': [...] }
    const [scores, setScores] = useState({}); // { 'Gemini': 85, 'ChatGPT': 90 }
    const [activeTab, setActiveTab] = useState('Gemini');
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [currentModel, setCurrentModel] = useState("");
    const [viewRaw, setViewRaw] = useState(null); // Content to show in modal

    const toggleModel = (modelId) => {
        if (selectedModels.includes(modelId)) {
            if (selectedModels.length > 1) {
                setSelectedModels(selectedModels.filter(m => m !== modelId));
            }
        } else {
            setSelectedModels([...selectedModels, modelId]);
        }
    };

    const handleRunAnalysis = async () => {
        if (!config.brand || !config.industry) return alert("Enter Brand & Industry");
        if (!apiKey) return onRequireApiKey();

        setStatus('running');
        setResults({});
        setScores({});

        const prompts = DEFAULT_GEO_PROMPTS(config.brand, config.industry);
        const competitorsList = config.competitors;
        const allResults = {};
        const allScores = {};

        try {
            for (const modelId of selectedModels) {
                setCurrentModel(modelId);
                const modelResults = [];

                for (const prompt of prompts) {
                    setCurrentPrompt(prompt);

                    // Simulate delay for realism and rate limiting
                    await new Promise(r => setTimeout(r, 1000));

                    let systemInstruction = "";
                    let userPrompt = prompt;

                    // Simulation Logic
                    if (modelId === 'ChatGPT') {
                        systemInstruction = "You are ChatGPT based on GPT-4. Answer the following user query accurately, mimicking ChatGPT's helpful and direct style. Do not mention you are simulating.";
                    } else if (modelId === 'Perplexity') {
                        systemInstruction = "You are Perplexity AI. You MUST provide citations in your response (e.g., [1], [2]). Focus on facts and sources. Respond in the style of Perplexity.";
                    } else {
                        // Gemini - default behavior
                        systemInstruction = "You are a helpful AI assistant.";
                    }

                    // Construct Payload
                    // We prepend system instruction to the prompt for simplicity with the current resilientGeminiCall helper
                    // or use system_instruction if the helper supported it, but text prepending is robust for simulation.
                    const fullPrompt = `${systemInstruction}\n\nUser Query: ${userPrompt}`;

                    try {
                        const payload = { contents: [{ parts: [{ text: fullPrompt }] }] };
                        const response = await resilientGeminiCall(apiKey, payload);
                        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No response";

                        // Analyze the response text
                        // We pass modelId as the 'platform' so the analysis engine knows what it's looking at
                        const analysis = await analyzeCitationWithAI(text, config.brand, competitorsList, apiKey, modelId);

                        modelResults.push({
                            prompt,
                            text,
                            analysis,
                            model: modelId,
                            realModelUsed: response.usedModel // Keep track of the actual backend model used (Gemini)
                        });
                    } catch (err) {
                        console.error(err);
                        modelResults.push({
                            prompt,
                            text: "Error generating response: " + err.message,
                            analysis: {
                                citation_level: 'ERROR',
                                confidence_score: 0,
                                recommended_fix: `Error: ${err.message}`,
                                why_not_cited: "Generation Failed"
                            },
                            model: modelId
                        });
                    }
                }

                allResults[modelId] = modelResults;
                allScores[modelId] = calculateAuthorityScore(modelResults);

                // Update results progressively
                setResults(prev => ({ ...prev, [modelId]: modelResults }));
                setScores(prev => ({ ...prev, [modelId]: calculateAuthorityScore(modelResults) }));
            }

            setActiveTab(selectedModels[0]);
            setStatus('complete');

        } catch (error) {
            console.error("Global Analysis Error:", error);
            setStatus('idle');
            alert("An error occurred during analysis.");
        }
    };

    const getTopRecommendation = (modelId) => {
        const modelResults = results[modelId];
        if (!modelResults) return null;

        const badResult = modelResults.find(r => r.analysis.citation_level === 'NO_MENTION' || r.analysis.citation_level === 'MENTION_ONLY' || r.analysis.citation_level === 'ERROR');
        if (badResult && badResult.analysis.recommended_fix) {
            return {
                type: badResult.analysis.why_not_cited || "Low Authority",
                fix: badResult.analysis.recommended_fix
            };
        }
        return null;
    };

    const currentScore = scores[activeTab] || 0;
    const topFix = getTopRecommendation(activeTab);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">

            {/* RAW DATA MODAL */}
            {viewRaw && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setViewRaw(null)}
                    />
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col relative z-50 animate-fade-in">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-900 truncate pr-4">
                                <span className="text-slate-500 mr-2">[{viewRaw.model}]</span>
                                {viewRaw.prompt}
                            </h3>
                            <button onClick={() => setViewRaw(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><XCircle size={24} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto font-mono text-sm text-slate-600 whitespace-pre-wrap">
                            <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                                <span>Simulated Profile: {viewRaw.model}</span>
                                <span>Generated via: {viewRaw.realModelUsed || 'Unknown'}</span>
                            </div>
                            {viewRaw.text}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wide mb-4">
                    <Quotes weight="fill" className="text-amber-400" />
                    Citation Intelligence
                </div>
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
                    Are you a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Cited Authority</span>?
                </h1>
                <p className="text-slate-600 max-w-2xl text-lg">
                    Mentions count, but Citations rule. This engine detects if AI models attribute claims to your brand
                    (Truth) or just list you as an option (Commodity).
                </p>
            </div>

            {/* Config Panel */}
            {status === 'idle' && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-3xl">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Brand</label>
                            <input
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="e.g. Linear"
                                value={config.brand}
                                onChange={e => setConfig({ ...config, brand: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Industry / Category</label>
                            <input
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="e.g. Issue Tracking"
                                value={config.industry}
                                onChange={e => setConfig({ ...config, industry: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Competitors (Optional)</label>
                        <input
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g. Jira, Asana"
                            value={config.competitors}
                            onChange={e => setConfig({ ...config, competitors: e.target.value })}
                        />
                    </div>

                    {/* AI Model Selection */}
                    <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-4">
                            AI Models to Analyze
                        </label>
                        <div className="grid md:grid-cols-3 gap-3">
                            {AI_MODELS.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => toggleModel(model.id)}
                                    className={`relative p-4 rounded-lg border-2 text-left transition-all ${selectedModels.includes(model.id)
                                        ? 'border-amber-500 bg-white shadow-md'
                                        : 'border-slate-200 hover:border-slate-300 bg-slate-100/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <model.icon
                                            size={20}
                                            weight={selectedModels.includes(model.id) ? "fill" : "regular"}
                                            className={selectedModels.includes(model.id) ? "text-amber-500" : "text-slate-400"}
                                        />
                                        <span className={`font-bold text-sm ${selectedModels.includes(model.id) ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {model.name}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight">
                                        {model.description}
                                    </p>
                                    {selectedModels.includes(model.id) && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle className="text-amber-500" weight="fill" size={16} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                            <Warning size={12} />
                            Different AI platforms cite sources differently. Select which models you want to evaluate.
                        </p>
                    </div>

                    <button
                        onClick={handleRunAnalysis}
                        className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        <Lightning weight="fill" className="text-amber-400" />
                        Run Citation Analysis
                    </button>

                    <p className="mt-4 text-center text-[10px] text-slate-400">
                        AI platforms do not expose internal data. Results are based on repeatable prompt simulations.
                    </p>
                </div>
            )}

            {status === 'running' && (
                <div className="text-center py-24 animate-fade-in">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-slate-900">Scanning Neural Pathways...</h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
                        Targeting: <span className="font-bold text-slate-900">{currentModel}</span>
                        <br />
                        Simulating: <span className="font-mono text-xs bg-slate-100 p-1 rounded">{currentPrompt}</span>
                    </p>
                </div>
            )}

            {/* Results Dashboard */}
            {status === 'complete' && (
                <div className="animate-fade-in space-y-8">

                    {/* Model Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
                        {selectedModels.map(modelId => (
                            <button
                                key={modelId}
                                onClick={() => setActiveTab(modelId)}
                                className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all relative top-[1px] ${activeTab === modelId
                                    ? 'bg-white text-amber-600 border border-slate-200 border-b-white z-10'
                                    : 'bg-slate-50 text-slate-500 border-b border-slate-200 hover:text-slate-700'
                                    }`}
                            >
                                {modelId}
                            </button>
                        ))}
                    </div>

                    {/* Score Card */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-2">Citation Authority Score</h3>
                                <div className="text-6xl font-display font-bold text-amber-400 mb-2">{currentScore}<span className="text-2xl text-slate-500">/100</span></div>
                                <div className="inline-flex px-3 py-1 rounded-full bg-white/10 text-xs font-bold border border-white/20">
                                    {currentScore > 80 ? 'Recognized Authority' : currentScore > 50 ? 'Emerging Source' : 'Low Authority'}
                                </div>
                                <div className="mt-4 text-xs text-slate-500">
                                    Based on analysis of {activeTab} responses
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Target className="text-amber-500" size={24} />
                                Fix Recommendations ({activeTab})
                            </h3>
                            <div className="space-y-4">
                                {topFix ? (
                                    <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-xl">
                                        <Bug className="text-amber-600 mt-1 min-w-[20px]" weight="fill" size={24} />
                                        <div>
                                            <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-1">
                                                Diagnosis: {topFix.type}
                                            </h4>
                                            <p className="text-amber-800 text-sm mb-3">
                                                {activeTab} is failing to cite your brand properly. Recommended Fix:
                                            </p>
                                            <code className="block bg-white/50 p-3 rounded-lg text-xs text-amber-900 font-mono border border-amber-100/50">
                                                {topFix.fix}
                                            </code>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-green-700 p-4 bg-green-50 rounded-xl">
                                        <CheckCircle size={24} weight="fill" />
                                        <span className="font-medium">Great job! {activeTab} consistently cites your brand as an authority.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Prompt Analysis Detail: {activeTab}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 w-1/4">Prompt</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Evidence & Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {results[activeTab]?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 align-top">
                                                <div className="text-sm font-medium text-slate-900 mb-1">{item.prompt}</div>
                                                <button
                                                    onClick={() => setViewRaw(item)}
                                                    className="text-[10px] uppercase font-bold text-amber-600 hover:text-amber-700 hover:underline tracking-wide bg-amber-50 px-2 py-1 rounded inline-flex items-center gap-1"
                                                >
                                                    View Raw Output <ArrowRight size={10} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className={`
                                                    inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border
                                                    ${item.analysis.citation_level === 'STRONG_CITATION' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        item.analysis.citation_level === 'DEFINITION_OWNERSHIP' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                            item.analysis.citation_level === 'MENTION_ONLY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                item.analysis.citation_level === 'ERROR' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-slate-100 text-slate-600 border-slate-200'}
                                                `}>
                                                    {item.analysis.citation_level?.replace('_', ' ') || 'UNKNOWN'}
                                                </div>
                                                <div className="mt-2 text-xs text-slate-400 font-mono">
                                                    Trust Score: {item.analysis.confidence_score}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top text-sm text-slate-600">
                                                {item.analysis.citation_sentence && (
                                                    <div className="mb-2 p-2 bg-slate-50 rounded italic border-l-2 border-slate-300">
                                                        "{item.analysis.citation_sentence}"
                                                    </div>
                                                )}
                                                {item.analysis.why_not_cited && (
                                                    <div className="text-red-500 text-xs font-medium flex items-center gap-1">
                                                        <Warning size={12} weight="fill" />
                                                        {item.analysis.why_not_cited}
                                                    </div>
                                                )}
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
