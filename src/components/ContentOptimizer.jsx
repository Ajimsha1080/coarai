import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { MagnifyingGlass, Sparkle, Brain, Copy, Info, Clock, ExternalLink, Warning, Lightning, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import HistoryDrawer from './HistoryDrawer';
import { resilientGeminiCall } from '../lib/gemini';

export default function ContentOptimizer({ apiKey, tavilyApiKey, onRequireApiKey, mode = 'full' }) {
    const { currentUser } = useAuth();
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step1Result, setStep1Result] = useState(null);
    const [step2Result, setStep2Result] = useState(null);
    const [rawMarkdown, setRawMarkdown] = useState('');
    const [sources, setSources] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState('Copy Markdown');
    const [showInfo, setShowInfo] = useState(false);

    // Error & Simulation State
    const [error, setError] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);

    const resultsRef = useRef(null);
    const inputRef = useRef(null);

    // Load History
    useEffect(() => {
        if (!currentUser) {
            setHistoryItems([]);
            return;
        }

        const q = query(
            collection(db, `users/${currentUser.uid}/history`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistoryItems(items);
        });

        return unsubscribe;
    }, [currentUser]);

    const searchTavily = async (query, key) => {
        // 1. Try calling the Netlify Function (Backend Proxy) to avoid CORS
        try {
            const response = await fetch('/.netlify/functions/tavily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            if (response.ok) {
                return await response.json();
            }
            // If function fails (e.g. locally without `netlify login`), fall through to direct call
            console.warn("Backend proxy failed, trying direct Tavily call (may fail CORS)...");
        } catch (e) {
            console.warn("Backend proxy error:", e);
        }

        // 2. Fallback: Direct Call (Likely to fail CORS in Prod, but works if proxy is down locally)
        if (!key || key.includes('YOUR_KEY_HERE')) {
            throw new Error("Missing Tavily API Key. Please add it in Netlify Environment Variables.");
        }

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: key,
                query: query,
                search_depth: "advanced",
                include_answer: true,
                max_results: 5
            })
        });

        if (!response.ok) {
            throw new Error(`Tavily API error: ${response.statusText}`);
        }

        return await response.json();
    };

    const analyzeQuestions = async (topic, geminiKey, tavilyKey) => {
        // Use Tavily for Research Mode (Questioner)
        if (mode === 'research') {
            const searchResult = await searchTavily(`common questions people ask about ${topic}`, tavilyKey);

            let context = "";
            if (searchResult.answer) {
                context += `Tavily Summary: ${searchResult.answer}\n\n`;
            }
            context += "Search Results:\n" + searchResult.results.map(r => `- ${r.title}: ${r.content}`).join("\n");

            const systemPrompt = `You are a search analyst. Analyze the provided search results to identify the 5 most frequent and relevant user questions about: "${topic}". Structure your response as a numbered list.`;
            const userQuery = `Search Data:\n${context}\n\nBased ONLY on the above search data, what are the top 5 questions users are asking?`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };

            const result = await resilientGeminiCall(geminiKey, payload);
            const text = result.candidates[0].content.parts[0].text;

            const groundingMetadata = {
                groundingAttributions: searchResult.results.map(r => ({
                    web: {
                        uri: r.url,
                        title: r.title
                    }
                }))
            };

            return { text, groundingMetadata };
        }

        // Use Google Search Grounding for Full/Optimizer Mode
        // STRICT GEMINI ONLY (No Tavily Fallback)
        else {
            const systemPrompt = `You are an expert search trend analyst. Your goal is to identify the real, high-intent questions users are asking about a specific topic. Use Google Search to find current data.`;
            const userQuery = `Find the top 5 most frequent and specific questions users are asking about "${topic}". List them clearly.`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                tools: [{ googleSearch: {} }] // Enable Google Search Grounding
            };

            // Direct Call - Will throw error if Gemini fails (e.g. 429/404)
            const result = await resilientGeminiCall(geminiKey, payload);
            const text = result.candidates[0].content.parts[0].text;

            // Extract grounding metadata from Gemini response if available
            const groundingMetadata = result.candidates[0].groundingMetadata || { groundingAttributions: [] };

            return { text, groundingMetadata };
        }
    };

    const generateOptimizedContent = async (questionsAnalysis, key) => {
        const userQuery = `Based on the following analysis of user questions, write a single, highly structured, approximately 200-word response in clean Markdown. The content must directly and concisely answer the core themes of the questions, making it optimized for fast and accurate AI citation.\n\nUser Questions Analysis:\n${questionsAnalysis}`;
        const systemPrompt = `You are a world-class content strategist. Generate only the clean Markdown text. Use clear headings and lists. DO NOT include any introductory or concluding sentences outside of the requested Markdown body.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        // Direct Call - Will throw error if Gemini fails
        const result = await resilientGeminiCall(key, payload);
        return result.candidates[0].content.parts[0].text;
    };

    const saveToHistory = async (topic, questionsAnalysis, optimizedMarkdown, sources) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, `users/${currentUser.uid}/history`), {
                topic,
                questionsAnalysis,
                optimizedMarkdown: optimizedMarkdown || '',
                sources,
                mode,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving history:", error);
        }
    };

    const loadHistoryItem = (item) => {
        setTopic(item.topic);
        setStep1Result(marked.parse(item.questionsAnalysis));
        if (item.optimizedMarkdown) {
            setStep2Result(marked.parse(item.optimizedMarkdown));
            setRawMarkdown(item.optimizedMarkdown);
        } else {
            setStep2Result(null);
            setRawMarkdown('');
        }
        setSources(item.sources || []);
        setShowResults(true);
        setError(null); // Clear errors
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // --- FALLBACK SIMULATION ---
    const runSimulation = () => {
        setIsLoading(true);
        setError(null);
        setIsSimulating(true);

        setTimeout(() => {
            const topicSafe = topic || "Artificial Intelligence";

            // 1. Simulated Analysis
            const simQuestions = `
### Top Questions regarding ${topicSafe}:
1. **What are the key benefits of using ${topicSafe} in enterprise?**
2. **How does ${topicSafe} compare to traditional solutions?**
3. **What is the cost structure for implementing ${topicSafe}?**
4. **Are there security risks associated with ${topicSafe}?**
5. **How to get started with ${topicSafe} for beginners?**
            `;
            setStep1Result(marked.parse(simQuestions));

            // 2. Simulated Sources
            setSources([
                { web: { title: "Forbes Tech Analysis", uri: "#" } },
                { web: { title: "TechCrunch Report 2024", uri: "#" } },
                { web: { title: "Gartner Magic Quadrant", uri: "#" } }
            ]);

            // 3. Simulated Optimization
            const simContent = `
## The Definitive Guide to ${topicSafe}

**${topicSafe}** is currently reshaping industry standards by offering automated efficiency and predictive analytics that traditional models cannot match.

### Key Benefits
*   **Cost Reduction**: Reduces operational overhead by 40% on average.
*   **Scalability**: Automatically adjusts resources based on real-time demand.
*   **Security**: Implement Zero Trust architecture by default.

### Getting Started
To begin with ${topicSafe}, organizations should focus on data hygiene and pilot small-scale integration before enterprise-wide rollout. Experts recommend allocating 15% of the IT budget to this transition for optimal results.
            `;

            if (mode === 'full') {
                setStep2Result(marked.parse(simContent));
                setRawMarkdown(simContent);
            }

            setShowResults(true);
            setIsLoading(false);
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        }, 2000); // Fake delay
    };

    const startWorkflow = async () => {
        if (!apiKey) {
            onRequireApiKey();
            return;
        }

        if (!topic.trim()) {
            if (inputRef.current) {
                inputRef.current.classList.add('ring-red-500', 'ring-2');
                setTimeout(() => inputRef.current.classList.remove('ring-red-500', 'ring-2'), 500);
            }
            return;
        }

        setIsLoading(true);
        setShowResults(false);
        setError(null); // Clear previous errors
        setStep1Result(null);
        setStep2Result(null);
        setRawMarkdown('');
        setIsSimulating(false); // Reset sim flag

        try {
            // Step 1: Research (Questioner)
            const { text: questionsText, groundingMetadata } = await analyzeQuestions(topic, apiKey, tavilyApiKey);
            setStep1Result(marked.parse(questionsText));

            const attributions = groundingMetadata?.groundingAttributions || [];
            setSources(attributions);

            let optimizedMarkdown = null;

            // Step 2: Generation (Optimizer Only)
            if (mode === 'full') {
                optimizedMarkdown = await generateOptimizedContent(questionsText, apiKey);
                setStep2Result(marked.parse(optimizedMarkdown));
                setRawMarkdown(optimizedMarkdown);
            }

            // Automatically Save
            if (currentUser) {
                saveToHistory(topic, questionsText, optimizedMarkdown, attributions);
            }

            setShowResults(true);

            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            console.error("Workflow Failed:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!rawMarkdown) return;
        navigator.clipboard.writeText(rawMarkdown).then(() => {
            setCopyFeedback('Copied!');
            setTimeout(() => setCopyFeedback('Copy Markdown'), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            const textarea = document.createElement('textarea');
            textarea.value = rawMarkdown;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopyFeedback('Copied!');
            setTimeout(() => setCopyFeedback('Copy Markdown'), 2000);
        });
    };

    return (
        <section id="tool" className="relative z-10 py-20 bg-white/50 border-y border-white/50 backdrop-blur-sm">
            <HistoryDrawer
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                historyItems={historyItems}
                onLoadItem={loadHistoryItem}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Tool Header */}
                <div className="text-center mb-12 relative">
                    <h2 className="text-3xl font-display font-bold text-slate-900">
                        {mode === 'research' ? 'AI Questioner' : 'AI Content Optimizer'}
                    </h2>

                    {currentUser && (
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="absolute right-0 top-0 hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-brand-600 transition-all shadow-sm"
                        >
                            <Clock weight="bold" />
                            History
                        </button>
                    )}
                </div>

                {/* Input Card */}
                <div className="clean-card rounded-2xl p-1 shadow-xl shadow-brand-900/5 ring-1 ring-slate-900/5 transform transition-all hover:shadow-brand-500/10">
                    <div className="bg-white rounded-xl p-6 sm:p-10">
                        <label htmlFor="topicInput" className="block text-sm font-semibold text-slate-700 mb-2">
                            {mode === 'research' ? 'What topic do you want to explore?' : 'What do you want to rank for?'}
                        </label>
                        <div className="relative flex items-center group">
                            <MagnifyingGlass className="absolute left-4 text-slate-400 text-xl group-focus-within:text-brand-500 transition-colors" weight="bold" />
                            <input
                                ref={inputRef}
                                type="text"
                                id="topicInput"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., 'best enterprise CRM' or 'how to bake sourdough'"
                                className="w-full pl-12 pr-20 sm:pr-40 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-base sm:text-lg shadow-inner outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && startWorkflow()}
                            />
                            <div className="absolute right-2 top-2 bottom-2 flex gap-2">
                                {currentUser && (
                                    <button
                                        onClick={() => setIsHistoryOpen(true)}
                                        className="md:hidden p-3 text-slate-400 hover:text-brand-600 transition-colors"
                                    >
                                        <Clock weight="bold" className="text-xl" />
                                    </button>
                                )}
                                <button
                                    onClick={startWorkflow}
                                    disabled={isLoading}
                                    className="px-4 sm:px-6 bg-slate-900 text-white rounded-lg font-medium hover:bg-brand-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-md"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                            <span className="hidden sm:inline">Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">{mode === 'research' ? 'Find Questions' : 'Analyze'}</span>
                                            <MagnifyingGlass weight="bold" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="flex items-center gap-1 text-slate-400 hover:text-brand-500 transition-colors focus:outline-none"
                                    title="How it works"
                                >
                                    <Info className="text-brand-500" weight="fill" />
                                    <span className="text-xs font-medium border-b border-dotted border-slate-400">How it works</span>
                                </button>
                                {showInfo && (
                                    <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-md animate-fade-in">
                                        {mode === 'research'
                                            ? 'Uses Tavily Search to find real user questions.'
                                            : 'Uses Google Search Grounding to find real user questions.'}
                                    </span>
                                )}
                            </div>
                            {!currentUser && (
                                <span className="text-xs text-brand-600 font-medium">Log in to save your history</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ERROR STATE */}
                {error && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Warning className="text-red-500 text-2xl flex-shrink-0" weight="fill" />
                            <div>
                                <h4 className="font-bold text-red-700">Analysis Failed</h4>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={runSimulation}
                            className="flex-shrink-0 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <Lightning weight="fill" />
                            Simulate Result (Demo)
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="mt-12 text-center">
                        <div className="inline-flex flex-col items-center">
                            <div className="relative w-16 h-16 mb-4">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="text-brand-500 text-2xl animate-pulse" weight="fill" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 animate-pulse">
                                {mode === 'research' ? 'Scanning Search Trends...' : 'Analyzing & Optimizing...'}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {mode === 'research' ? 'Gathering real-time questions from the web.' : 'Gathering questions and generating optimized content.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Results Container */}
                {showResults && !isLoading && (
                    <div id="results-container" ref={resultsRef} className="mt-12 space-y-8">

                        {isSimulating && (
                            <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mb-4">
                                <Warning weight="fill" />
                                <span>DEMO MODE: Displaying simulated results because the live API is unavailable.</span>
                            </div>
                        )}

                        {/* Step 1: Analysis (Questioner Result) */}
                        <div className="clean-card bg-white rounded-2xl p-8 border-l-4 border-brand-500 animate-fade-in">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg shadow-sm">1</div>
                                <div className="flex-grow">
                                    <h3 className="text-xl font-display font-bold text-slate-900 mb-4">User Questions Analysis</h3>
                                    <div
                                        className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-inner"
                                        dangerouslySetInnerHTML={{ __html: step1Result }}
                                    />
                                    <div className="mt-4 text-xs text-slate-400 flex flex-wrap gap-2">
                                        <span className="font-semibold text-slate-500">Sources:</span>
                                        {sources.length > 0 ? (
                                            sources.map((s, i) => {
                                                // Extract safely for different API formats (Tavily vs Google)
                                                const title = s.web?.title || s.title || `Source ${i + 1}`;
                                                const uri = s.web?.uri || s.uri || "#";

                                                return (
                                                    <React.Fragment key={i}>
                                                        {i > 0 && <span>•</span>}
                                                        <a href={uri} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-700 underline decoration-brand-200 transition-colors">
                                                            {title}
                                                        </a>
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            <span>
                                                {mode === 'full'
                                                    ? 'No specific grounding sources returned by Google Search.'
                                                    : 'No specific search results used.'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 & 3: Generation (Optimizer ONLY) */}
                        {mode === 'full' && (
                            <>
                                <div className="clean-card bg-white rounded-2xl p-8 border-l-4 border-dark-800 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-lg shadow-sm">2</div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-display font-bold text-slate-900">AI-Optimized Content</h3>
                                                <div className="flex items-center gap-2">
                                                    {currentUser ? (
                                                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide shadow-sm flex items-center gap-1">
                                                            <Sparkle weight="fill" /> Saved to History
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wide shadow-sm">
                                                            Log in to Auto-save
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={copyToClipboard}
                                                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                                                        title="Copy Text"
                                                    >
                                                        <Copy weight="bold" />
                                                    </button>
                                                </div>
                                                <div
                                                    className="prose prose-slate max-w-none min-h-[100px] animate-fade-in"
                                                    dangerouslySetInnerHTML={{ __html: step2Result }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="clean-card bg-dark-900 text-white rounded-2xl p-8 shadow-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-xl font-display font-bold mb-2">Deploy this content</h3>
                                            <p className="text-slate-300 text-sm max-w-lg">
                                                This content is structured for maximum LLM retrieval. Host it on a clean, fast-loading page for best results.
                                            </p>
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex-shrink-0 px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-brand-50 transition-all shadow-lg flex items-center gap-2 group active:scale-95"
                                        >
                                            <Copy className="text-lg group-hover:scale-110 transition-transform" weight="bold" />
                                            <span>{copyFeedback}</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                )}
            </div>
        </section>
    );
}
