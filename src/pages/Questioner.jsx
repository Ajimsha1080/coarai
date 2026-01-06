import React from 'react';
import ContentOptimizer from '../components/ContentOptimizer';

// QuestionerPage configures the ContentOptimizer in 'research' mode
export default function QuestionerPage({ apiKey, tavilyApiKey, onRequireApiKey }) {
    return (
        <div className="pt-24 min-h-screen bg-slate-50">
            <ContentOptimizer
                mode="research"
                apiKey={apiKey}
                tavilyApiKey={tavilyApiKey}
                onRequireApiKey={onRequireApiKey}
            />
        </div>
    );
}
