import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CoaraApi } from '../lib/coaraApi';
import { Spinner, CheckCircle, Warning, FloppyDisk, Play, Info } from '@phosphor-icons/react';

const BrandTwin = () => {
    const [formData, setFormData] = useState({
        brandName: 'Coarai',
        tone: 'Professional & Authoritative',
        forbidden: 'cheap, free, discount, bad quality',
        claims: 'World’s fastest AI engine. 99.9% uptime guaranteed. Enterprise-grade security.',
    });

    const [saving, setSaving] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);

    const handleCreate = async () => {
        setSaving(true);
        try {
            // In a real app we'd check if it exists first or use upsert
            await CoaraApi.createBrand({
                name: "Demo Brand",
                website: "https://demo.com",
                industry: "Tech"
            });
            // Then update the twin details
            await CoaraApi.updateBrandTwin('demo-id', {
                tone: formData.tone,
                forbidden_terms: formData.forbidden.split(',').map(s => s.trim()),
                compliance_rules: { claims: formData.claims }
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save profile. Ensure backend is running.");
        } finally {
            setSaving(false);
        }
    };

    const handleSimulate = async () => {
        setSimulating(true);
        setSimulationResult(null);
        try {
            // Using real-time Twin configuration
            const forbiddenList = formData.forbidden.split(',').map(s => s.trim()).filter(s => s);

            const res = await CoaraApi.injectAnswer({
                user_prompt: "Why is " + (formData.brandName || "your brand") + " the best choice for enterprise customers?",
                context: "Competitive comparison and product pitch",
                rules: {
                    tone: formData.tone,
                    forbidden_terms: forbiddenList,
                    key_claims: formData.claims
                }
            });
            setSimulationResult(res);
        } catch (error) {
            console.error(error);
            alert("Simulation failed. Check console.");
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Brand Digital Twin Engine</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Programmable AI Identity & Compliance Manager</p>
                </div>
                <div>
                    {lastSaved && <span className="text-xs text-green-600 mr-4">Saved {lastSaved.toLocaleTimeString()}</span>}
                    <button
                        onClick={handleCreate}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Spinner className="animate-spin" /> : <FloppyDisk weight="bold" />}
                        Save Profile
                    </button>
                </div>
            </motion.div>

            {/* Educational Info Box */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-8"
            >
                <div className="flex gap-3">
                    <Info size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-blue-800 dark:text-blue-300 font-bold">What is a Brand Digital Twin?</h3>
                        <p className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
                            Think of this as your brand's <strong>"AI Constitution"</strong>. It is a set of strict rules that governs how Artificial Intelligence speaks about you.
                            Instead of letting ChatGPT or Gemini hallucinate, you force them to follow your guidelines.
                        </p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                <span className="block font-bold text-blue-900 dark:text-blue-200 text-xs uppercase mb-1">1. Guardrails</span>
                                <span className="text-blue-800 dark:text-blue-300 text-xs">Block words like "cheap" or "free" to protect prestige.</span>
                            </div>
                            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                <span className="block font-bold text-blue-900 dark:text-blue-200 text-xs uppercase mb-1">2. Personality</span>
                                <span className="text-blue-800 dark:text-blue-300 text-xs">Enforce a "Witty" or "Executive" tone everywhere.</span>
                            </div>
                            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                <span className="block font-bold text-blue-900 dark:text-blue-200 text-xs uppercase mb-1">3. Non-Negotiables</span>
                                <span className="text-blue-800 dark:text-blue-300 text-xs">Ensure your key USP (e.g. "Fastest") is always stated.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Column */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                        Identity Configuration
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Name</label>
                            <input
                                type="text"
                                value={formData.brandName}
                                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Tone</label>
                            <select
                                value={formData.tone}
                                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option>Professional & Authoritative</option>
                                <option>Friendly & Conversational</option>
                                <option>Witty & Humorous</option>
                                <option>Urgent & Sales-driven</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Forbidden Terms (Comma separated)</label>
                            <input
                                type="text"
                                value={formData.forbidden}
                                onChange={(e) => setFormData({ ...formData, forbidden: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Brand Claims</label>
                            <textarea
                                value={formData.claims}
                                onChange={(e) => setFormData({ ...formData, claims: e.target.value })}
                                rows={4}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <h3 className="text-amber-800 dark:text-amber-400 font-semibold text-sm mb-1">Knowledge Base</h3>
                                <p className="text-xs text-amber-700 dark:text-amber-500">Upload PDFs or connect URL to train the vector DB.</p>
                            </div>
                            <button className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-lg font-medium hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors">
                                Upload Documents
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="bg-slate-50 dark:bg-black/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
                            Live AI Verify
                        </h2>
                        <button
                            onClick={handleSimulate}
                            disabled={simulating}
                            className="flex items-center gap-2 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {simulating ? <Spinner className="animate-spin" /> : <Play weight="fill" />}
                            Run Simulation
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Test Prompt</p>
                            <p className="text-slate-800 dark:text-slate-200">"Why is {formData.brandName || "[Brand]"} better than the competition for enterprise?"</p>
                        </div>

                        <div className="flex justify-center">
                            <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700"></div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900 p-5 rounded-xl relative overflow-hidden transition-all">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                            </div>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Generated Response (Twin-Active)</p>

                            {simulationResult ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                        {simulationResult.injected_answer || "No response generated."}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className={`px-2 py-1 ${simulationResult.compliance_check.tone_match ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'} text-xs rounded-lg flex items-center gap-1`}>
                                            {simulationResult.compliance_check.tone_match ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}
                                            {simulationResult.compliance_check.tone_match ? 'Tone Match' : 'Tone Miss'}
                                        </span>
                                        <span className={`px-2 py-1 ${simulationResult.compliance_check.claims_included ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'} text-xs rounded-lg flex items-center gap-1`}>
                                            {simulationResult.compliance_check.claims_included ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}
                                            Claims Verified
                                        </span>
                                        <span className={`px-2 py-1 ${simulationResult.compliance_check.forbidden_terms_avoided ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'} text-xs rounded-lg flex items-center gap-1`}>
                                            {simulationResult.compliance_check.forbidden_terms_avoided ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}
                                            Safety Check
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <p className="text-slate-400 italic text-sm">Run simulation to see how the AI represents your brand...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandTwin;
