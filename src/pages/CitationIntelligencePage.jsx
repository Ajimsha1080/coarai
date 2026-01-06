import React from 'react';
import CitationDashboard from '../components/citation/CitationDashboard';

export default function CitationIntelligencePage({ apiKey, onRequireApiKey }) {
    return (
        <div className="pt-24 pb-20">
            <CitationDashboard apiKey={apiKey} onRequireApiKey={onRequireApiKey} />
        </div>
    );
}
