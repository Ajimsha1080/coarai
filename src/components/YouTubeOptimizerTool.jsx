import React, { useState } from 'react';
import { YoutubeLogo, Copy, Download, MagicWand, Info, CaretRight, Check, Warning, FileText, VideoCamera } from '@phosphor-icons/react';
import { resilientGeminiCall } from '../lib/gemini';
import { marked } from 'marked';

export default function YouTubeOptimizerTool({ apiKey, onRequireApiKey }) {
    const [inputs, setInputs] = useState({
        url: '',
        title: '',
        transcript: '',
        topic: ''
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [activeTab, setActiveTab] = useState('metadata'); // metadata, chapters, transcript, insights

    const handleAnalyze = async () => {
        if (!apiKey) {
            onRequireApiKey();
            return;
        }

        if (!inputs.transcript && !inputs.title) {
            alert("Please provide at least a Title or Transcript to analyze.");
            return;
        }

        setIsAnalyzing(true);
        setResults(null);

        // Construct the prompt
        const prompt = `
            You are a YouTube Growth Expert and Generative Engine Optimization (GEO) specialist.
            Analyze the following video context to optimize it for YouTube Search and AI Video Summarization (Gemini, ChatGPT, Perplexity).

            **Video Context:**
            ${inputs.url ? `- URL: ${inputs.url}` : ''}
            ${inputs.title ? `- Current Title: ${inputs.title}` : ''}
            ${inputs.topic ? `- Focus Topic: ${inputs.topic}` : ''}
            
            **Transcript / Content:**
            ${inputs.transcript || "No transcript provided. Improve based on title and topic context."}

            **Tasks:**
            1. **Optimized Title:** Create a catchy, high-SEO title (under 70 chars) that clearly states value.
            2. **Optimized Description:** Write a description optimized for AI summaries. First 2 lines must explain the "Hook" and "Value". Use structured paragraphs.
            3. **Timestamp Structure:** detailed timestamp/chapter breakdown based on the content flow.
            4. **Clean Transcript Snippet:** Rewrite the first ~3-5 sentences of the content to be perfectly grammatical and clear (as a sample).
            5. **Visibility Insights:** Explain how AI models currently "see" this content and what is missing.

            **Output Format (JSON ONLY):**
            {
                "optimizedTitle": "...",
                "optimizedDescription": "...",
                "chapters": [
                    { "time": "00:00", "label": "..." },
                    { "time": "...", "label": "..." }
                ],
                "transcriptSample": "...",
                "insights": {
                    "currentAiView": "...",
                    "missingInfo": "...",
                    "score": 85
                }
            }
        `;

        try {
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            const response = await resilientGeminiCall(apiKey, payload);
            const data = JSON.parse(response.candidates[0].content.parts[0].text);
            setResults(data);

        } catch (error) {
            console.error(error);
            alert("Optimization failed. Please check your inputs or API key.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Toast could be added here
    };

    const downloadSRT = () => {
        if (!results || !results.chapters) return;
        let content = "";
        results.chapters.forEach((chap, idx) => {
            content += `${idx + 1}\n${chap.time},000 --> ${results.chapters[idx + 1] ? results.chapters[idx + 1].time : 'END'},000\n${chap.label}\n\n`;
        });
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chapters.srt';
        a.click();
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-xl mb-4 text-red-600">
                    <YoutubeLogo size={32} weight="fill" />
                </div>
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">YouTube Optimizer</h1>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                    Optimize your videos for YouTube Search and AI Summaries.
                    Structure your content to be "watchable" by humans and "readable" by machines.
                </p>
            </div>

            {/* Input Section */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-24">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <VideoCamera className="text-brand-600" size={20} />
                        Video Details
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Video URL (Optional)</label>
                            <input
                                type="text"
                                placeholder="https://youtube.com/..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={inputs.url}
                                onChange={(e) => setInputs({ ...inputs, url: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Video Title</label>
                            <input
                                type="text"
                                placeholder="e.g. How to use Gemini for SEO"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={inputs.title}
                                onChange={(e) => setInputs({ ...inputs, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Topic / Keyword</label>
                            <input
                                type="text"
                                placeholder="e.g. AI SEO Strategy"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={inputs.topic}
                                onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                                Transcript / Content
                                <span className="text-xs text-brand-600 ml-1 font-normal">(Recommended)</span>
                            </label>
                            <textarea
                                rows={8}
                                placeholder="Paste your video transcript, script, or rough notes here..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                value={inputs.transcript}
                                onChange={(e) => setInputs({ ...inputs, transcript: e.target.value })}
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <MagicWand weight="bold" />
                                    Optimize Video
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    {!results ? (
                        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 h-96 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <VideoCamera className="text-6xl mb-4 opacity-20" weight="fill" />
                            <h3 className="text-lg font-semibold text-slate-600">Ready to Optimize</h3>
                            <p className="max-w-sm">Enter your video details and transcript to generate AI-friendly metadata and chapters.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                            {/* Tabs */}
                            <div className="flex border-b border-slate-100 overflow-x-auto">
                                {[
                                    { id: 'metadata', label: 'Title & Description', icon: FileText },
                                    { id: 'chapters', label: 'Timestamp Chapters', icon: VideoCamera },
                                    { id: 'insights', label: 'AI Insights', icon: Info },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                                ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                            }`}
                                    >
                                        <tab.icon size={18} weight={activeTab === tab.id ? "bold" : "regular"} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-8 min-h-[500px]">
                                {activeTab === 'metadata' && (
                                    <div className="space-y-8 animate-fade-in">
                                        {/* Title Section */}
                                        <div className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Optimized Title</h4>
                                                <button onClick={() => copyToClipboard(results.optimizedTitle)} className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800">
                                                {results.optimizedTitle}
                                            </div>
                                            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                                <Check weight="bold" /> Optimized for CTR & Semantic Search
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Optimized Description</h4>
                                                <button onClick={() => copyToClipboard(results.optimizedDescription)} className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed font-mono text-sm max-h-96 overflow-y-auto">
                                                {results.optimizedDescription}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'chapters' && (
                                    <div className="animate-fade-in">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Video Structure</h4>
                                            <button
                                                onClick={downloadSRT}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-colors"
                                            >
                                                <Download size={16} weight="bold" /> Download SRT
                                            </button>
                                        </div>

                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200">
                                                        <th className="px-6 py-3 font-semibold text-slate-700 w-32">Timestamp</th>
                                                        <th className="px-6 py-3 font-semibold text-slate-700">Section Title</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {results.chapters.map((chapter, i) => (
                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-3 font-mono text-brand-600 font-medium">{chapter.time}</td>
                                                            <td className="px-6 py-3 text-slate-800">{chapter.label}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'insights' && (
                                    <div className="grid gap-6 animate-fade-in">
                                        <div className="bg-gradient-to-br from-brand-50 to-white p-6 rounded-xl border border-brand-100">
                                            <h4 className="flex items-center gap-2 text-lg font-bold text-brand-900 mb-4">
                                                <MagicWand className="text-brand-600" size={24} weight="fill" />
                                                AI Visibility Score: {results.insights.score}/100
                                            </h4>
                                            <p className="text-brand-800 mb-2">
                                                <strong>How AI sees this:</strong> {results.insights.currentAiView}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                            <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                <Warning className="text-amber-500" size={20} weight="fill" />
                                                Missing Information
                                            </h5>
                                            <p className="text-slate-600 leading-relaxed">
                                                {results.insights.missingInfo}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                            <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                <FileText className="text-blue-500" size={20} weight="fill" />
                                                Writing Sample (Rewritten for Clarity)
                                            </h5>
                                            <p className="text-slate-600 italic border-l-4 border-blue-200 pl-4 py-1">
                                                "{results.transcriptSample}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Disclaimer: This tool optimizes content for AI understanding. Search rankings are influenced by many factors and are not guaranteed.
                    </p>
                </div>
            </div>
        </div>
    );
}
