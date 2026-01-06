import React from 'react';
import YouTubeOptimizerTool from '../components/YouTubeOptimizerTool';

export default function YouTubeOptimizer({ apiKey, onRequireApiKey }) {
    return (
        <div className="pt-24 pb-20">
            <YouTubeOptimizerTool apiKey={apiKey} onRequireApiKey={onRequireApiKey} />
        </div>
    );
}
