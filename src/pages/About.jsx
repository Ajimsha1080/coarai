import React from 'react';

export default function About() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">About Prompting Co.</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        We are defining the future of content in the age of Generative AI.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
                    <p className="text-slate-600 leading-relaxed mb-8">
                        Traditional SEO is evolving. With the rise of Large Language Models (LLMs) like Gemini, ChatGPT, and Claude, users are getting answers directly in the search interface.
                        Prompting Co. builds tools to help brands ensure their content is authoritative, structured, and visible in these new AI-generated results.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Do</h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 mb-8">
                        <li><strong className="font-semibold text-slate-900">AI Visibility Monitoring:</strong> Track how your brand appears in AI answers.</li>
                        <li><strong className="font-semibold text-slate-900">Generative Engine Optimization (GEO):</strong> Optimize content structure for LLM retrieval.</li>
                        <li><strong className="font-semibold text-slate-900">Brand Audits:</strong> Analyze brand perception across multiple AI models.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
