import React, { Suspense } from 'react';
import ScriptGeoOptimizer from '../components/ScriptGeoOptimizer';

export default function ScriptGeoOptimizerPage({ apiKey, onRequireApiKey }) {
    return (
        <ScriptGeoOptimizer apiKey={apiKey} onRequireApiKey={onRequireApiKey} />
    );
}
