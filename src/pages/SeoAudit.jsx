import React from 'react';
import SeoAuditTool from '../components/SeoAuditTool';

export default function SeoAuditPage({ apiKey, onRequireApiKey }) {
    return (
        <SeoAuditTool apiKey={apiKey} onRequireApiKey={onRequireApiKey} />
    );
}
