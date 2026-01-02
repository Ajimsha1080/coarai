import React from 'react';
import GeoBrandAudit from '../components/GeoBrandAudit';

export default function BrandAudit({ apiKey, onRequireApiKey }) {
    return (
        <div className="min-h-screen font-sans text-slate-900">
            <main>
                <GeoBrandAudit apiKey={apiKey} onRequireApiKey={onRequireApiKey} />
            </main>
        </div>
    );
}
