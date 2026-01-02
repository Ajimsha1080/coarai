import React from 'react';
import DriftDashboard from '../components/drift/DriftDashboard';

export default function PromptDriftPage({ apiKey, onRequireApiKey }) {
    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <DriftDashboard apiKey={apiKey} onRequireApiKey={onRequireApiKey} />
        </div>
    );
}
