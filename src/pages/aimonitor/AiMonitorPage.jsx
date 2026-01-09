import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Correct path to context
import { db } from '../../firebase'; // Correct path to firebase
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import ConfigForm from '../../components/ai-monitor/ConfigForm';
import MonitorDashboard from '../../components/ai-monitor/MonitorDashboard';
import { generatePrompts } from '../../lib/ai-monitor/prompt-engine';
import { fetchSimulatedResponse, analyzeResponse } from '../../lib/ai-monitor/analyzer';
import { saveRun } from '../../lib/ai-monitor/storage';

export default function AiMonitorPage({ apiKey }) {
    const { currentUser } = useAuth();
    const [view, setView] = useState('loading'); // 'loading', 'config', 'dashboard'
    const [config, setConfig] = useState(null);
    const [currentRun, setCurrentRun] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            if (!currentUser) {
                setView('config'); // Or prompt login
                return;
            }
            // Check for last run
            try {
                const q = query(collection(db, `users/${currentUser.uid}/monitor_runs`), orderBy('createdAt', 'desc'), limit(1));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const lastRun = { id: snap.docs[0].id, ...snap.docs[0].data() };
                    setCurrentRun(lastRun);
                    setConfig(lastRun.config);
                    setView('dashboard');
                } else {
                    setView('config');
                }
            } catch (e) {
                console.error("Error loading data", e);
                setView('config');
            }
        };
        loadInitialData();
    }, [currentUser]);

    const startMonitoring = async (newConfig) => {
        // if (!currentUser) return alert("Please login first"); // Removed for demo access

        setConfig(newConfig);
        setIsRunning(true);
        setView('dashboard');
        setProgress(0);

        // 1. Generate Prompts
        const prompts = generatePrompts(newConfig);
        const totalSteps = prompts.length;

        const responses = [];
        const metrics = {
            totalPrompts: totalSteps,
            brandMentions: 0,
            competitorMentions: {},
            sentimentScore: 0, // simple accumulator
            errorCount: 0
        };

        // 2. Execution Loop
        // We'll run them sequentially to avoid rate limits on the client key
        // Ideally this should be server-side queue.
        for (let i = 0; i < totalSteps; i++) {
            // Rate limit safety delay
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 3500));

            const prompt = prompts[i];

            // A. Fetch
            const rawText = await fetchSimulatedResponse(apiKey, prompt.text);

            // B. Analyze
            const analysis = await analyzeResponse(apiKey, rawText, newConfig.brandName, newConfig.competitors || []);

            // C. Accumulate
            if (analysis.error) {
                metrics.errorCount++;
            } else {
                if (analysis.mentioned) metrics.brandMentions++;
                if (analysis.sentiment === 'positive') metrics.sentimentScore += 1;
                if (analysis.sentiment === 'negative') metrics.sentimentScore -= 1;

                analysis.competitors_mentioned.forEach(c => {
                    metrics.competitorMentions[c] = (metrics.competitorMentions[c] || 0) + 1;
                });
            }

            // Assign a random platform for this simulation step to populate the dashboard categories
            const platforms = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude'];
            const simulatedPlatform = platforms[Math.floor(Math.random() * platforms.length)];

            responses.push({
                prompt: prompt.text,
                category: prompt.category,
                rawText,
                analysis,
                platform: simulatedPlatform
            });

            setProgress(Math.round(((i + 1) / totalSteps) * 100));
        }

        // 3. Finalize
        const finalRunData = {
            config: newConfig,
            timestamp: new Date().toISOString(),
            metrics: {
                ...metrics,
                visibilityScore: Math.round((metrics.brandMentions / totalSteps) * 100),
                sentimentIndex: metrics.sentimentScore
            },
            responses,
            status: 'completed'
        };

        try {
            if (currentUser) {
                await saveRun(currentUser.uid, finalRunData);
            }
            setCurrentRun(finalRunData);
        } catch (e) {
            console.error("Save failed", e);
        }

        setIsRunning(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900">AI Visibility Monitor</h1>
                        <p className="text-slate-500 mt-2">Track your brand's presence in Generative Engine Results.</p>
                    </div>
                    {view === 'dashboard' && !isRunning && (
                        <button
                            onClick={() => setView('config')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-800"
                        >
                            Configure / New Run
                        </button>
                    )}
                </div>

                {/* Views */}
                {view === 'loading' && <div className="text-center py-20">Loading...</div>}

                {view === 'config' && (
                    <ConfigForm
                        onStart={startMonitoring}
                        initialData={config}
                        isLoading={isRunning}
                    />
                )}

                {view === 'dashboard' && (
                    <MonitorDashboard
                        runData={currentRun}
                        isRunning={isRunning}
                        progress={progress}
                    />
                )}
            </div>
        </div>
    );
}
