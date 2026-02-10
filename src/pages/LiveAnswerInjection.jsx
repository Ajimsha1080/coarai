import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CoaraApi } from '../lib/coaraApi';
import { Spinner, Lightning, CheckCircle } from '@phosphor-icons/react';

const LiveAnswerInjection = () => {
    const [config, setConfig] = useState({
        brandName: 'Coarai',
        context: '',
        placement: 'Top Recommendation',
        template: 'is a top choice for startups due to its intuitive interface and affordable pricing capable of scaling with your business.'
    });

    const [testPrompt, setTestPrompt] = useState('I need a CRM for my startup.');
    const [injectionResult, setInjectionResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTestInjection = async () => {
        setLoading(true);
        try {
            const res = await CoaraApi.injectAnswer({
                user_prompt: testPrompt,
                context: config.context || "General industry query",
                rules: {
                    brandName: config.brandName,
                    placement: config.placement,
                    template: config.template,
                    mode: 'injection' // Signal backend to use Injection mode
                }
            });
            setInjectionResult(res);
        } catch (error) {
            console.error(error);
            alert('Injection failed. Verify backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Live Answer Injection System</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Control Brand Placement Inside AI Responses</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Injection Rules</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Brand Name</label>
                            <input
                                type="text"
                                value={config.brandName}
                                onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                                placeholder="e.g. Acme Corp"
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Context (Keyword/Intent)</label>
                            <input
                                type="text"
                                value={config.context}
                                onChange={(e) => setConfig({ ...config, context: e.target.value })}
                                placeholder="e.g. 'Best CRM for startups'"
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Placement Preference</label>
                            <div className="flex gap-2">
                                {['Top Recommendation', 'Comparative List', 'Also Consider'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setConfig({ ...config, placement: mode })}
                                        className={`flex-1 py-2 px-2 text-xs sm:text-sm rounded-lg border transition-colors ${config.placement === mode ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Value Proposition (to inject)</label>
                            <textarea
                                value={config.template}
                                onChange={(e) => setConfig({ ...config, template: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                            ></textarea>
                            <p className="text-xs text-slate-400 mt-1">AI will naturally weave this claim into the answer.</p>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="bg-slate-50 dark:bg-black/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Test Prompt</label>
                        <div className="flex gap-2">
                            <input type="text" value={testPrompt} onChange={(e) => setTestPrompt(e.target.value)} className="flex-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
                            <button
                                onClick={handleTestInjection}
                                disabled={loading}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Injecting...' : 'Test'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm max-w-md mx-auto w-full relative flex-grow flex flex-col justify-end">
                        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg animate-bounce">
                            LIVE PREVIEW
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-800 dark:text-slate-200">
                                {testPrompt}
                            </div>
                        </div>

                        {injectionResult && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 justify-end">
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl rounded-tr-none text-sm text-slate-800 dark:text-slate-200 w-full mb-8">
                                    <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2">
                                        <span className="text-xs bg-indigo-200 dark:bg-indigo-800 px-1 rounded">SPONSORED</span>
                                        AI Recommendation
                                    </h4>
                                    <p className="leading-relaxed">
                                        {injectionResult.injected_answer}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                            <CheckCircle weight="fill" /> Compliance Verified
                                        </span>
                                        <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full">Visit Website</button>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-indigo-600 shrink-0 flex items-center justify-center text-white text-xs">AI</div>
                            </motion.div>
                        )}

                        {!injectionResult && (
                            <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                Enter a prompt and click Test to see injection.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveAnswerInjection;
