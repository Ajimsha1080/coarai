import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resilientGeminiCall } from '../lib/gemini';
import { MagnifyingGlass, CheckCircle, Warning, CaretDown, CaretUp, Clock, ArrowRight, Brain } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function SeoAuditTool({ apiKey, onRequireApiKey }) {
    const { currentUser } = useAuth();
    const [productName, setProductName] = useState('');
    const [keyFeatures, setKeyFeatures] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [auditResult, setAuditResult] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    // History
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);

    useEffect(() => {
        if (!currentUser) { setHistoryItems([]); return; }
        const q = query(collection(db, `users/${currentUser.uid}/seo-history`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setHistoryItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsubscribe;
    }, [currentUser]);

    const runAudit = async () => {
        if (!apiKey) { onRequireApiKey(); return; }
        if (!productName.trim() || !keyFeatures.trim()) { alert("Please enter both Product Name and Key Features."); return; }

        setIsLoading(true);
        setStatusMessage("Initializing Dual-Stage Audit...");
        setAuditResult(null);

        try {
            // STEP 1: Deep Research (Google Search)
            setStatusMessage("Stage 1: Deep Research via Google Search...");
            const researchPayload = {
                contents: [{ parts: [{ text: `Find the current public description and key selling points of "${productName}". Include recent features if relevant.` }] }],
                tools: [{ googleSearch: {} }]
            };
            const researchResponse = await resilientGeminiCall(apiKey, researchPayload);
            const publicDescription = researchResponse.candidates[0].content.parts[0].text;

            // Grounding check - handle snake_case or camelCase
            const candidate = researchResponse.candidates[0];
            const grounding = candidate.groundingMetadata || candidate.grounding_metadata;

            // STEP 2: Gap Analysis & Optimization
            setStatusMessage("Stage 2: Gap Analysis & Optimization...");
            const analysisPrompt = `
                You are a GEO (Generative Engine Optimization) Content Strategist. 
                1. Analyze the following "Public Description" found online.
                2. Compare it against the "Client Key Features" provided below.
                3. Identify which Client Key Features are MISSING or under-represented in the Public Description.
                4. Write a single, high-impact optimized snippet (1 paragraph) that weaves these missing points into the existing narrative to bridge the gap.
            
                Return ONLY a valid JSON object with this schema:
                {
                    "missingKeyPoints": ["string", "string"],
                    "optimizedSnippet": "string"
                }

                Public Description:
                "${publicDescription}"

                Client Key Features:
                "${keyFeatures}"
            `;

            const analysisPayload = {
                contents: [{ parts: [{ text: analysisPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            const analysisResponse = await resilientGeminiCall(apiKey, analysisPayload);
            let textResponse = analysisResponse.candidates[0].content.parts[0].text;

            // Cleanup Markdown code blocks if present
            textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            let jsonResult;
            try {
                jsonResult = JSON.parse(textResponse);
            } catch (e) {
                console.error("JSON Parse Error", textResponse);
                // Fallback if parsing fails - try to extract object portion
                const match = textResponse.match(/{[\s\S]*}/);
                if (match) {
                    try {
                        jsonResult = JSON.parse(match[0]);
                    } catch (e2) {
                        throw new Error("Failed to parse AI response as JSON.");
                    }
                } else {
                    throw new Error("Invalid AI response format.");
                }
            }

            const resultData = {
                publicDescription,
                missingKeyPoints: jsonResult.missingKeyPoints || [],
                optimizedSnippet: jsonResult.optimizedSnippet || "",
                sources: grounding?.groundingAttributions || []
            };

            setAuditResult(resultData);

            // Save to History
            if (currentUser) {
                await addDoc(collection(db, `users/${currentUser.uid}/seo-history`), {
                    productName,
                    keyFeatures,
                    result: resultData,
                    createdAt: serverTimestamp()
                });
            }

        } catch (error) {
            console.error(error);
            alert("Audit failed: " + error.message);
        } finally {
            setIsLoading(false);
            setStatusMessage("");
        }
    };

    const loadHistory = (item) => {
        setProductName(item.productName);
        setKeyFeatures(item.keyFeatures);
        setAuditResult(item.result);
        setIsHistoryOpen(false);
    };

    return (
        <div className="relative z-10 py-20 bg-white/50 border-y border-white/50 backdrop-blur-sm">
            {/* History Drawer */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 p-6 shadow-2xl overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display text-xl text-slate-900 font-bold">Audit History</h3>
                            <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-brand-600">Close</button>
                        </div>
                        <div className="space-y-4">
                            {historyItems.map(item => (
                                <div key={item.id} onClick={() => loadHistory(item)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer border border-slate-200 transition-colors">
                                    <p className="font-bold text-sm text-slate-900 truncate">{item.productName}</p>
                                    <p className="text-xs text-slate-500">{new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
                {/* Header */}
                <header className="mb-16 text-center relative">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                            GEO Intelligence
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight text-slate-900">
                            Content Gap <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-700">Audit Engine</span>
                        </h1>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            Detect what Google sees versus what you sell. Identify narrative gaps and generate optimized bridges instantly.
                        </p>
                    </motion.div>

                    {currentUser && (
                        <button onClick={() => setIsHistoryOpen(true)} className="absolute right-0 top-0 text-sm text-gray-400 hover:text-white flex items-center gap-2">
                            <Clock weight="bold" /> History
                        </button>
                    )}
                </header>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="clean-card bg-white rounded-2xl p-8 mb-12 shadow-xl shadow-slate-200/50"
                >
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Product / Topic Name</label>
                            <div className="relative">
                                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={productName} onChange={(e) => setProductName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. Acme Analytics Pro"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Key Features (The "Truth")</label>
                            <textarea
                                value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-[58px] min-h-[58px] resize-none overflow-hidden placeholder:text-slate-400"
                                placeholder="List features that SHOULD be known..."
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={runAudit} disabled={isLoading}
                            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-600 transition-all disabled:opacity-70 flex items-center gap-2 shadow-lg"
                        >
                            {isLoading ? (
                                <><span>Scanning...</span> <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></>
                            ) : (
                                <><span>Run Audit</span> <ArrowRight weight="bold" /></>
                            )}
                        </button>
                    </div>
                    {isLoading && <p className="text-center text-xs text-slate-500 mt-4 animate-pulse">{statusMessage}</p>}
                </motion.div>

                {/* Results Section */}
                {auditResult && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Gap Analysis Card */}
                        <div className="clean-card bg-white p-8 rounded-2xl border-l-4 border-l-red-500 shadow-md">
                            <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Warning className="text-red-500" size={24} weight="fill" />
                                Narrative Gaps Detected
                            </h3>
                            {auditResult.missingKeyPoints.length > 0 ? (
                                <ul className="space-y-3">
                                    {auditResult.missingKeyPoints.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-emerald-600 font-medium">No major gaps detected. The public description aligns well with your key features.</p>
                            )}
                        </div>

                        {/* Optimized Snippet Card */}
                        <div className="clean-card bg-white p-8 rounded-2xl border-l-4 border-l-blue-500 shadow-md">
                            <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Brain className="text-blue-500" size={24} weight="fill" />
                                AI Optimized Bridge Snippet
                            </h3>
                            <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 text-slate-700 leading-relaxed font-serif">
                                "{auditResult.optimizedSnippet}"
                            </div>
                            <div className="mt-2 text-right">
                                <span className="text-xs font-mono text-slate-400">Powered by Gemini 2.5</span>
                            </div>
                        </div>

                        {/* Public Context (Collapsible) */}
                        <details className="clean-card bg-white p-6 rounded-2xl group cursor-pointer shadow-sm">
                            <summary className="font-bold text-slate-500 flex items-center justify-between list-none hover:text-slate-700 transition-colors">
                                <span>Reference: Public Context Found</span>
                                <CaretDown className="group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-slate-500 text-sm">
                                <p className="mb-4">{auditResult.publicDescription}</p>
                                <div className="flex flex-wrap gap-2">
                                    {auditResult.sources.map((s, i) => (
                                        <a key={i} href={s.web?.uri || '#'} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline">
                                            [{i + 1}] {s.web?.title || 'Source'}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </details>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
