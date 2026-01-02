import React, { useState } from 'react';
import { Target, Robot, Users, Buildings, Play, Plus, Trash } from '@phosphor-icons/react';

export default function ConfigForm({ onStart, initialData, isLoading }) {
    const [formData, setFormData] = useState(initialData || {
        brandName: '',
        industry: '',
        category: '', // e.g., CRM
        competitors: [''],
        productNames: ['']
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompetitorChange = (index, value) => {
        const newCompetitors = [...formData.competitors];
        newCompetitors[index] = value;
        setFormData({ ...formData, competitors: newCompetitors });
    };

    const addCompetitor = () => {
        if (formData.competitors.length < 10) {
            setFormData({ ...formData, competitors: [...formData.competitors, ''] });
        }
    };

    const removeCompetitor = (index) => {
        const newCompetitors = list.filter((_, i) => i !== index);
        setFormData({ ...formData, competitors: newCompetitors });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Target className="text-brand-600" size={24} />
                        Monitor Configuration
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Configure the brand and competitors you want to track across AI platforms.</p>
                </div>

                <div className="p-8 space-y-6">
                    {/* Brand Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Brand Name</label>
                            <input
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                                placeholder="e.g. Acme Corp"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Industry / Vertical</label>
                            <input
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                placeholder="e.g. Marketing Automation"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Product Category</label>
                        <input
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g. Email Marketing Software"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                        <p className="text-xs text-slate-400 mt-1">Used to generate queries like "Top [category] tools"</p>
                    </div>

                    {/* Platforms & Frequency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">AI Platforms to Monitor</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input type="checkbox" checked disabled className="rounded text-brand-600 focus:ring-brand-500" />
                                    Google Gemini (Active)
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-400">
                                    <input type="checkbox" disabled className="rounded text-slate-300" />
                                    ChatGPT (Coming Soon)
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-400">
                                    <input type="checkbox" disabled className="rounded text-slate-300" />
                                    Perplexity (Coming Soon)
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Monitoring Frequency</label>
                            <select
                                name="frequency"
                                value={formData.frequency || 'Weekly'}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
                            >
                                <option value="Weekly">Weekly (Recommended)</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Daily">Daily</option>
                            </select>
                            <p className="text-xs text-slate-400 mt-1">Automated reports will be sent to your email.</p>
                        </div>
                    </div>

                    {/* Competitors */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Competitors (Max 10)</label>
                        <div className="space-y-3">
                            {formData.competitors.map((comp, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        value={comp}
                                        onChange={(e) => handleCompetitorChange(idx, e.target.value)}
                                        placeholder={`Competitor ${idx + 1}`}
                                        className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                    {formData.competitors.length > 1 && (
                                        <button
                                            onClick={() => {
                                                const newC = [...formData.competitors];
                                                newC.splice(idx, 1);
                                                setFormData({ ...formData, competitors: newC });
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {formData.competitors.length < 10 && (
                            <button
                                onClick={addCompetitor}
                                className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                            >
                                <Plus weight="bold" /> Add Competitor
                            </button>
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={() => onStart(formData)}
                            disabled={!formData.brandName || !formData.category || isLoading}
                            className="px-6 py-3 bg-brand-600 text-white rounded-lg font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>Running...</>
                            ) : (
                                <>
                                    <Play weight="fill" /> Start Simulation
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
