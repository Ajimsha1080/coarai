
import React from 'react';
import VisibilityDashboard from '../components/visibility/VisibilityDashboard';

export default function PromptVisibilityPage({ apiKey, onRequireApiKey }) {
    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <VisibilityDashboard apiKey={apiKey} onRequireApiKey={onRequireApiKey} />
        </div>
    );
}
