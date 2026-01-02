import React from 'react';
import ContentOptimizer from '../components/ContentOptimizer';

// This is passed from App.jsx or context in a real app, 
// but we'll accept props here to pass them down
export default function OptimizerPage({ apiKey, tavilyApiKey, onRequireApiKey }) {
    return (
        <div className="pt-24 min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">AI Questioner</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Deep dive into user intent. uncovering the specific questions driving search traffic and generate authoritative answers instantly.
                </p>
            </div>
            <ContentOptimizer
                apiKey={apiKey}
                tavilyApiKey={tavilyApiKey}
                onRequireApiKey={onRequireApiKey}
            />
        </div>
    );
}
