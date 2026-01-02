import { generatePrompts as engineGenerate } from '../ai-monitor/prompt-engine';
import { analyzeResponse, fetchSimulatedResponse } from '../ai-monitor/analyzer';

// wrapper to keep logic distinct
export const generateDriftPrompts = (config) => {
    // We can just reuse the engine for now, or simplify
    return engineGenerate(config);
};

export const promptRunner = async (prompts, apiKey, onProgress) => {
    const results = [];
    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];

        let responseText = "";
        let analysis = null;

        try {
            // 3.5s Delay (Enforced by requirements)
            if (i > 0) {
                await new Promise(r => setTimeout(r, 3500));
            }

            responseText = await fetchSimulatedResponse(apiKey, prompt.text);

            // We need brandName and competitors from the prompt object or passed in context
            // prompt-engine returns prompt.category, prompt.text. 
            // We need to parse mention target from config which isn't passed here.
            // Let's assume the caller passes the context needed for analysis.
            // We'll refactor promptRunner to accept 'context'.
        } catch (e) {
            console.error(e);
            responseText = "Error";
        }

        results.push({
            id: prompt.id,
            text: prompt.text,
            response: responseText,
            timestamp: Date.now()
        });

        if (onProgress) onProgress(i + 1, prompts.length);
    }
    return results;
};

// We separate analysis to allow it to run after fetching if needed, 
// though running it inline saves time. Let's run inline in the main flow for simplicity, 
// or export this helper.
export const analyzeMentions = async (promptResults, apiKey, brandName, competitors, onProgress) => {
    const analyzed = [];
    for (let i = 0; i < promptResults.length; i++) {
        const item = promptResults[i];
        const analysis = await analyzeResponse(apiKey, item.response, brandName, competitors || []);
        analyzed.push({
            ...item,
            analysis
        });
        if (onProgress) onProgress(i + 1, promptResults.length);
    }
    return analyzed;
};

export const compareRuns = (baseline, comparison) => {
    return baseline.map((baseItem, index) => {
        const compItem = comparison.find(c => c.id === baseItem.id) || comparison[index];

        const baseMent = baseItem.analysis?.mentioned || false;
        const compMent = compItem.analysis?.mentioned || false;

        const baseScore = baseItem.analysis?.prominence_score || 0;
        const compScore = compItem.analysis?.prominence_score || 0;

        const baseSent = baseItem.analysis?.sentiment || 'neutral';
        const compSent = compItem.analysis?.sentiment || 'neutral';

        let status = 'STABLE';
        let changeDescription = 'No significant change';
        let color = 'gray';

        if (baseMent && !compMent) {
            status = 'LOST';
            changeDescription = 'Brand disappeared from results';
            color = 'red';
        } else if (!baseMent && compMent) {
            status = 'GAINED';
            changeDescription = 'Brand appeared in results';
            color = 'green';
        } else if (Math.abs(baseScore - compScore) >= 2) {
            status = 'SHIFTED';
            changeDescription = baseScore > compScore ? 'Visibility dropped' : 'Visibility improved';
            color = baseScore > compScore ? 'orange' : 'green';
        } else if (baseSent !== compSent) {
            status = 'SHIFTED';
            changeDescription = `Sentiment changed: ${baseSent} → ${compSent}`;
            color = 'orange';
        }

        return {
            id: baseItem.id,
            prompt: baseItem.text,
            baseline: baseItem.analysis,
            comparison: compItem.analysis,
            drift: {
                status,
                changeDescription,
                color,
                scoreDelta: compScore - baseScore
            }
        };
    });
};
