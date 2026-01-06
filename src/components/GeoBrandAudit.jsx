import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import { resilientGeminiCall } from '../lib/gemini';
import { CheckCircle, Warning, CaretDown, CaretUp, Clock, ArrowRight, Brain, Globe, Buildings, FileText, Target } from '@phosphor-icons/react';
import GeoBrandAuditScores from './GeoBrandAuditScores';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import HistoryDrawer from './HistoryDrawer'; // Reuse if possible or duplicate logic

export default function GeoBrandAudit({ apiKey, onRequireApiKey }) {
    const { currentUser } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        brandName: '',
        productName: '',
        brandDescription: '',
        websiteUrl: '',
        websiteContent: '',
        geoContent: '',
        competitors: ''
    });

    const [isFetchingUrl, setIsFetchingUrl] = useState(false);
    const [urlError, setUrlError] = useState('');
    const [contentSource, setContentSource] = useState('manual'); // 'manual' or 'auto'

    const [isLoading, setIsLoading] = useState(false);
    const [loadingSource, setLoadingSource] = useState(null); // 'brand' or 'content'
    // Changed to Object: { brand: string, content: string }
    const [auditResult, setAuditResult] = useState(null);
    const [auditScores, setAuditScores] = useState(null); // Score object
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // History
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);

    useEffect(() => {
        if (!currentUser) { setHistoryItems([]); return; }
        const q = query(collection(db, `users/${currentUser.uid}/brand-audits`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setHistoryItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsubscribe;
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'websiteContent') {
            setContentSource('manual');
        }
    };

    const handleUrlExtraction = async () => {
        if (!formData.websiteUrl) return;
        if (!apiKey) { onRequireApiKey(); return; }

        setIsFetchingUrl(true);
        setUrlError('');

        try {
            // Use Gemini with Google Search Grounding to "read" the site
            const prompt = `
                I need to analyze the website content for a brand audit.
                Please visit this URL: ${formData.websiteUrl}
                
                Task:
                1. Read the homepage content.
                2. Extract the main hero text, feature descriptions, and product explanation.
                3. Ignore navigation menus, footers, privacy policies, and ads.
                4. Return a clean, structured summary of the core brand content (approx 300-500 words).
                
                Just return the content text.
            `;

            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                tools: [{ googleSearch: {} }]
            };

            const response = await resilientGeminiCall(apiKey, payload);
            const extractedText = response.candidates[0].content.parts[0].text;

            if (extractedText) {
                setFormData(prev => ({ ...prev, websiteContent: extractedText }));
                setContentSource('auto');
            } else {
                throw new Error("No content could be extracted.");
            }

        } catch (error) {
            console.error(error);
            setUrlError("Unable to fetch website content. Please paste content manually.");
        } finally {
            setIsFetchingUrl(false);
        }
    };

    const runAudit = async (source) => {
        // Flexible Validation: Require either Brand Name OR Website Content to proceed.
        if (!formData.brandName && !formData.websiteContent && !formData.websiteUrl) {
            alert("Please provide at least a Brand Name, Website URL, or Manual Content to run the audit.");
            return;
        }

        setIsLoading(true);
        setLoadingSource(source);
        setStatusMessage("Initializing GEO Brand Audit...");
        setAuditResult(null);
        setErrorMessage('');
        setAuditScores(null);
        setUrlError('');

        // AUTO-EXTRACTION: If URL is provided but Content is empty, fetch it now.
        let finalWebsiteContent = formData.websiteContent;
        if (formData.websiteUrl && !finalWebsiteContent) {
            try {
                setStatusMessage(`Analyzing ${formData.websiteUrl}...`);
                const extractionPrompt = `
                    I need to analyze the website content for a brand audit.
                    Please visit this URL: ${formData.websiteUrl}
                    
                    Task:
                    1. Read the homepage content.
                    2. Extract the main hero text, feature descriptions, and product explanation.
                    3. Ignore navigation menus, footers, privacy policies, and ads.
                    4. Return a clean, structured summary of the core brand content (approx 300-500 words).
                    
                    Just return the content text.
                `;

                const extractionPayload = {
                    contents: [{ parts: [{ text: extractionPrompt }] }],
                    tools: [{ googleSearch: {} }]
                };

                const extractionRes = await resilientGeminiCall(apiKey, extractionPayload);
                const extractedText = extractionRes.candidates[0].content.parts[0].text;

                if (extractedText) {
                    finalWebsiteContent = extractedText;
                    // Update state so the UI reflects it too
                    setFormData(prev => ({ ...prev, websiteContent: extractedText }));
                    setContentSource('auto');
                }
            } catch (err) {
                console.warn("Auto-extraction failed:", err);
                // Continue without content, or show a non-blocking warning? 
                // We'll continue, as the user might just want a Brand Name audit.
            }
        }

        setStatusMessage("Generating Audit Report...");

        try {
            const prompt = `
                You are a **Generative Engine Optimizer (GEO) Brand Audit Analyst**.

                You do NOT remember previous runs.
                You do NOT store data.
                You analyze ONLY the data provided in this request.

                Your job is to audit how a brand is represented in AI-generated answers
                and generative search systems (ChatGPT, Gemini, Perplexity).

                IMPORTANT: You must output a JSON object with two potentially separate analyses.

                –––––––––––––––––
                INPUT
                –––––––––––––––––

                Brand Name:
                ${formData.brandName || "Not Provided"}

                Website Content (raw text or summary):
                ${finalWebsiteContent || "Not provided"}

                GEO / FAQ / Help Page Content (if any):
                ${formData.geoContent || "Not provided"}

                Competitors (optional):
                ${formData.competitors || "Not provided"}

                –––––––––––––––––
                AUDIT OBJECTIVES
                –––––––––––––––––

                ### PART 1: BRAND KNOWLEDGE ANALYSIS (Based ONLY on Brand Name)
                Simulate how a general AI model would answer these questions based on its TRAINING DATA ONLY (ignore the provided website content for this part if possible, or use it to verify alignment):
                • "What is [Brand Name]?"
                • "What do they do?"
                • "Who is it for?"
                
                Identify:
                - General Brand Awareness (High/Low/Niche)
                - Potential Hallucinations (Confusing it with others?)
                - Positioning clarity in the public training set.

                ### PART 2: CONTENT OPTIMIZATION ANALYSIS (Based ONLY on the Provided Content)
                Evaluate the provided text for:
                • Clarity & Completeness (Does it explain the product well?)
                • GEO Readiness (Is it formatted for AI? FAQs? Definitions?)
                • Differentiation (vs Competitors)
                
                Generate a list of ACTIONS to improve this specific content.

                –––––––––––––––––
                FINAL OUTPUT FORMAT (JSON)
                –––––––––––––––––
                You must return a raw JSON object string (no markdown formatting around it).
                Structure:
                {
                    "brandAnalysis": "Markdown string for Part 1 (Brand Representation). include a header '🔍 AI Brand Representation'.",
                    "contentAnalysis": "Markdown string for Part 2 (Content Optimization). include a header '🚀 Content Optimization'.",
                    "scores": {
                        "aiAccuracy": 0-100,
                        "contentContextClarity": 0-100,
                        "contentCompleteness": 0-100,
                        "geoReadiness": 0-100
                    }
                }
            `;

            const payload = {
                contents: [{ parts: [{ text: prompt }] }]
            };

            const response = await resilientGeminiCall(apiKey, payload);
            const textResponse = response.candidates[0].content.parts[0].text;

            // Clean-up possible markdown code blocks
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const resultData = JSON.parse(cleanJson);

            setAuditResult({
                brand: resultData.brandAnalysis,
                content: resultData.contentAnalysis
            });

            setAuditScores(resultData.scores);

            if (currentUser) {
                await addDoc(collection(db, `users/${currentUser.uid}/brand-audits`), {
                    brandName: formData.brandName,
                    result: JSON.stringify({ brand: resultData.brandAnalysis, content: resultData.contentAnalysis }),
                    scores: resultData.scores,
                    createdAt: serverTimestamp()
                });
            }

        } catch (error) {
            console.error(error);
            // Removed: API KEY INVALID check

            if (true) {
                setErrorMessage(`API Warning (${error.message}). Displaying SIMULATED results.`);
                setAuditResult({
                    brand: `### 🔍 AI Brand Representation\n**Analysis:** AI models view **${formData.brandName || 'Brand'}** as a niche player.\n* **Visibility:** Low\n* **Hallucination Risk:** Medium`,
                    content: `### 🚀 Content Optimization\n**Analysis:** The content is clear but lacks structured data.\n* **Action:** Add specific FAQ definitions.`
                });
                setAuditScores({
                    aiAccuracy: 45,
                    contentContextClarity: 50,
                    contentCompleteness: 62,
                    geoReadiness: 28
                });
            } else {
                setErrorMessage("Analysis failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
            setLoadingSource(null);
            setStatusMessage("");
        }
    };

    const loadHistory = (item) => {
        try {
            const parsed = JSON.parse(item.result);
            setAuditResult(parsed);
        } catch (e) {
            setAuditResult({ brand: item.result, content: '' });
        }
        setFormData(prev => ({
            ...prev,
            brandName: item.brandName || ''
        }));
        setIsHistoryOpen(false);
    };

    return (
        <div className="relative z-10 py-20 bg-white/50 border-y border-white/50 backdrop-blur-sm min-h-screen">
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
                                    <p className="font-bold text-sm text-slate-900 truncate">{item.brandName || 'Untitled Audit'}</p>
                                    <p className="text-xs text-slate-500">{new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto px-6">

                {/* Header */}
                <header className="mb-12 text-center relative">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
                            GEO Intelligence
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight text-slate-900">
                            GEO Brand <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Audit Analyst</span>
                        </h1>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            Simulate how AI models perceive your brand. Identify hallucination risks, completeness gaps, and differentiation opportunities.
                        </p>
                    </motion.div>

                    {currentUser && (
                        <button onClick={() => setIsHistoryOpen(true)} className="absolute right-0 top-0 text-sm text-gray-400 hover:text-brand-600 flex items-center gap-2">
                            <Clock weight="bold" /> History
                        </button>
                    )}
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* INPUT COLUMN */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            className="clean-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                        >
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Buildings className="text-violet-500" size={20} /> Brand Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Brand Name *</label>
                                    <input
                                        name="brandName"
                                        value={formData.brandName}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                        placeholder="e.g. COAR"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Used to evaluate how AI recognizes your brand as an entity.</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Website URL (Optional)</label>
                                    <div className="relative">
                                        <input
                                            name="websiteUrl"
                                            value={formData.websiteUrl}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                            placeholder="https://example.com"
                                        />
                                        <button
                                            onClick={handleUrlExtraction}
                                            disabled={isFetchingUrl || !formData.websiteUrl}
                                            className="absolute right-1 top-1 bottom-1 px-2 bg-white rounded border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-200 disabled:opacity-50 transition-colors"
                                            title="Auto-extract content"
                                        >
                                            {isFetchingUrl ? (
                                                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <ArrowRight weight="bold" />
                                            )}
                                        </button>
                                    </div>
                                    {urlError ? (
                                        <p className="text-xs text-red-500 flex items-center gap-1"><Warning size={12} weight="fill" /> {urlError}</p>
                                    ) : (
                                        <p className="text-xs text-slate-400">Optional. If provided, we will validate and analyze your website content automatically.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => runAudit('brand')}
                                disabled={isLoading}
                                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-violet-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading && loadingSource === 'brand' ? (
                                    <><span>Analyzing...</span><div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div></>
                                ) : (
                                    <><span>Run Brand Audit</span><Brain weight="bold" /></>
                                )}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="clean-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                        >
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="text-violet-500" size={20} /> Content Context
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Website Content *</label>
                                        {contentSource === 'auto' && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                                <CheckCircle weight="fill" /> Auto-extracted
                                            </span>
                                        )}
                                        {contentSource === 'manual' && formData.websiteContent.length > 0 && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                                                Manual Input
                                            </span>
                                        )}
                                    </div>
                                    <textarea
                                        name="websiteContent"
                                        value={formData.websiteContent}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none h-32 resize-none"
                                        placeholder="Paste key landing page content, features, and product explanation..."
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        {contentSource === 'auto'
                                            ? "Website content is extracted automatically and may not reflect all pages. You can edit the content before running the audit."
                                            : "Used to validate whether your website clearly explains your brand to AI."}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">GEO / FAQ Content (Optional)</label>
                                    <textarea
                                        name="geoContent"
                                        value={formData.geoContent}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none h-20 resize-none"
                                        placeholder="Paste FAQs, help docs, or Q&A content..."
                                    />
                                    <p className="text-xs text-slate-400 mt-1">AI often reuses FAQ-style content when answering questions.</p>
                                </div>

                            </div>

                            <button
                                onClick={() => runAudit('content')}
                                disabled={isLoading}
                                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-violet-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading && loadingSource === 'content' ? (
                                    <><span>Analyzing...</span><div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div></>
                                ) : (
                                    <><span>Run Brand Audit</span><Brain weight="bold" /></>
                                )}
                            </button>
                        </motion.div>
                    </div>

                    {/* OUTPUT COLUMN */}
                    <div className="lg:col-span-2">
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 animate-pulse">
                                <Warning size={24} weight="fill" className="shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm">Audit Failed</h4>
                                    <p className="text-sm opacity-90">{errorMessage}</p>
                                </div>
                            </div>
                        )}
                        {auditResult ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="clean-card bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
                            >
                                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle className="text-green-500" weight="fill" /> Audit Complete
                                    </span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-mono text-slate-400">Generated by Gemini 2.5</span>
                                        <span className="text-[10px] font-medium text-slate-400">
                                            Source: {contentSource === 'auto' ? `Auto-extracted from ${formData.websiteUrl}` : 'User-provided content'}
                                        </span>
                                    </div>
                                </div>

                                {auditScores && (
                                    <div className="p-8 pb-0">
                                        <GeoBrandAuditScores scores={auditScores} />
                                    </div>
                                )}

                                <div className="p-8 grid md:grid-cols-2 gap-8 border-t border-slate-100 mt-6">
                                    {/* Column 1: Brand Analysis */}
                                    <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-xl prose-h2:text-slate-900 prose-p:text-slate-600 prose-a:text-violet-600">
                                        <div dangerouslySetInnerHTML={{ __html: marked.parse(auditResult.brand || '') }} />
                                    </div>

                                    {/* Column 2: Content Analysis */}
                                    <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-xl prose-h2:text-slate-900 prose-p:text-slate-600 prose-a:text-violet-600 md:border-l md:border-slate-100 md:pl-8">
                                        <div dangerouslySetInnerHTML={{ __html: marked.parse(auditResult.content || '') }} />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-12 text-center text-slate-400">
                                {isLoading ? (
                                    <div className="max-w-xs mx-auto">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto mb-6 flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <h3 className="text-slate-900 font-bold mb-2 text-lg">Thinking like an AI...</h3>
                                        <p className="text-sm">{statusMessage}</p>
                                    </div>
                                ) : (
                                    <>
                                        <Brain size={64} weight="duotone" className="mb-6 opacity-50" />
                                        <h3 className="text-lg font-bold text-slate-600 mb-2">Ready to Audit</h3>
                                        <p className="max-w-sm mx-auto">Fill in your brand details and content context to generate a comprehensive stateless GEO audit report.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
