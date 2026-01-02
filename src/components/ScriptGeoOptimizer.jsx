import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { resilientGeminiCall } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { TextAa, MagicWand, Copy, Check, Clock, ArrowRight, FileText } from '@phosphor-icons/react';

export default function ScriptGeoOptimizer({ apiKey, onRequireApiKey }) {
    const { currentUser } = useAuth();

    // Inputs
    const [scriptContent, setScriptContent] = useState('');
    const [brandName, setBrandName] = useState('');
    const [industry, setIndustry] = useState('');
    const [contentType, setContentType] = useState('Blog Post');

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null); // { original, optimized }
    const [showOptimized, setShowOptimized] = useState(true);
    const [copyFeedback, setCopyFeedback] = useState('');

    // History
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);

    useEffect(() => {
        if (!currentUser) { setHistoryItems([]); return; }
        const q = query(collection(db, `users/${currentUser.uid}/script_geo_history`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setHistoryItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsubscribe;
    }, [currentUser]);

    const runOptimization = async () => {
        if (!apiKey) { onRequireApiKey(); return; }
        if (!scriptContent.trim()) { alert("Please paste some content to optimize."); return; }

        setIsLoading(true);
        setResult(null);

        try {
            const systemPrompt = `You are a Generative Engine Optimization (GEO) editor.
            Rewrite the following content so it is easily understood, accurately summarized, and safely cited by AI models (ChatGPT, Gemini, Perplexity).
            
            Preserve the original meaning but:
            1. Improve clarity and remove fluff.
            2. Add explicit semantic structure using Markdown headings (H2, H3).
            3. Clarify vague claims with specific explanations.
            4. Ensure the tone is authoritative yet neutral (AI-citation-friendly).
            5. Add a short "Frequently Asked Questions" section at the end if one is missing.

            Input Context:
            - Brand: ${brandName || "General"}
            - Industry: ${industry || "General"}
            - Content Type: ${contentType}

            Return ONLY the clean Markdown output. Do not wrap in JSON.`;

            const payload = {
                contents: [{ parts: [{ text: `Original Content:\n${scriptContent}` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            };

            // No tools needed (pure transformation)
            const response = await resilientGeminiCall(apiKey, payload);
            const optimizedText = response.candidates[0].content.parts[0].text;

            const newResult = {
                original: scriptContent,
                optimized: optimizedText,
                brandName,
                contentType
            };

            setResult(newResult);
            setShowOptimized(true);

            // Save to Firestore
            if (currentUser) {
                await addDoc(collection(db, `users/${currentUser.uid}/script_geo_history`), {
                    ...newResult,
                    createdAt: serverTimestamp()
                });
            }

        } catch (error) {
            console.error("Optimization failed:", error);
            alert("Optimization failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadHistory = (item) => {
        setScriptContent(item.original);
        setBrandName(item.brandName || '');
        setResult({
            original: item.original,
            optimized: item.optimized
        });
        setShowOptimized(true);
        setIsHistoryOpen(false);
    };

    const copyToClipboard = () => {
        if (!result?.optimized) return;
        navigator.clipboard.writeText(result.optimized);
        setCopyFeedback('Copied!');
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    return (
        <div className="relative min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
                            <MagicWand weight="fill" /> Script Transformer
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
                            Script → <span className="text-indigo-600">GEO Optimizer</span>
                        </h1>
                        <p className="text-slate-600 mt-2 max-w-2xl">
                            Convert drafts and scripts into AI-readable, citation-ready content optimized for Generative Engines.
                        </p>
                    </div>

                    {currentUser && (
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm text-sm font-medium"
                        >
                            <Clock weight="bold" /> History
                        </button>
                    )}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Input */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="text-indigo-500" size={20} /> Input Content
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Brand Name</label>
                                    <input
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Industry</label>
                                    <input
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Content Type</label>
                                <select
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option>Blog Post</option>
                                    <option>Video Script</option>
                                    <option>Landing Page Copy</option>
                                    <option>FAQ Section</option>
                                    <option>Technical Documentation</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Script / Draft</label>
                                <textarea
                                    value={scriptContent}
                                    onChange={(e) => setScriptContent(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[300px] resize-y"
                                    placeholder="Paste your content here..."
                                />
                            </div>

                            <button
                                onClick={runOptimization}
                                disabled={isLoading || !scriptContent.trim()}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <><span>Optimizing...</span><div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div></>
                                ) : (
                                    <><span>Convert to GEO-Optimized</span><ArrowRight weight="bold" /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Output */}
                    <div className="lg:col-span-7">
                        {result ? (
                            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-900/5 border border-slate-200 h-full flex flex-col overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                                    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                                        <button
                                            onClick={() => setShowOptimized(false)}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!showOptimized ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Original
                                        </button>
                                        <button
                                            onClick={() => setShowOptimized(true)}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${showOptimized ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            GEO Optimized
                                        </button>
                                    </div>

                                    {showOptimized && (
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow"
                                        >
                                            {copyFeedback ? <Check weight="bold" className="text-green-500" /> : <Copy weight="bold" />}
                                            {copyFeedback || 'Copy Markdown'}
                                        </button>
                                    )}
                                </div>

                                <div className="p-8 overflow-y-auto max-h-[800px]">
                                    {showOptimized ? (
                                        <div className="prose prose-indigo max-w-none prose-headings:font-display">
                                            <div dangerouslySetInnerHTML={{ __html: marked.parse(result.optimized) }} />
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap text-slate-600 font-mono text-sm leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            {result.original}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-12 text-center text-slate-400">
                                {isLoading ? (
                                    <div className="max-w-xs mx-auto animate-pulse">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto mb-6 flex items-center justify-center">
                                            <MagicWand size={32} weight="fill" className="text-indigo-500 animate-spin-slow" />
                                        </div>
                                        <h3 className="text-slate-900 font-bold mb-2 text-lg">Enhancing clarity & structure...</h3>
                                        <p className="text-sm">Applying GEO principles to make your content AI-ready.</p>
                                    </div>
                                ) : (
                                    <>
                                        <TextAa size={64} weight="duotone" className="mb-6 opacity-30" />
                                        <h3 className="text-lg font-bold text-slate-600 mb-2">Ready to Optimize</h3>
                                        <p className="max-w-xs mx-auto">Paste your script on the left to see the GEO-optimized transformation here.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* History Drawer (Simplified Overlay) */}
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
                        <div className="relative w-80 bg-white shadow-2xl h-full overflow-y-auto p-6 animate-slide-in-right">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-900">History</h3>
                                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-indigo-600">Close</button>
                            </div>
                            <div className="space-y-3">
                                {historyItems.map(item => (
                                    <div key={item.id} onClick={() => loadHistory(item)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer border border-slate-200 transition-colors text-left">
                                        <p className="font-bold text-sm text-slate-900 truncate">{item.brandName || 'Untitled Script'}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt?.seconds * 1000).toLocaleDateString()} • {item.contentType}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
