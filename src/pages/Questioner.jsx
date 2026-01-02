import React from 'react';
import ContentOptimizer from '../components/ContentOptimizer';

// QuestionerPage configures the ContentOptimizer in 'research' mode
export default function QuestionerPage({ apiKey, tavilyApiKey, onRequireApiKey }) {
    return (
        <div className="pt-24 min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">AI Questioner</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Deep dive into user intent. Uncover the specific questions driving search traffic.
                </p>
            </div>
            <ContentOptimizer
                mode="research"
                apiKey={apiKey}
                tavilyApiKey={tavilyApiKey}
                onRequireApiKey={onRequireApiKey}
            />
        </div>
    );
}
