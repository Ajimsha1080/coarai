import React from 'react';
import ContentOptimizer from '../components/ContentOptimizer';

// This is passed from App.jsx or context in a real app, 
// but we'll accept props here to pass them down
export default function OptimizerPage({ apiKey, tavilyApiKey, onRequireApiKey }) {
    return (
        <div className="pt-24 min-h-screen bg-slate-50">
            <ContentOptimizer
                apiKey={apiKey}
                tavilyApiKey={tavilyApiKey}
                onRequireApiKey={onRequireApiKey}
            />
        </div>
    );
}
