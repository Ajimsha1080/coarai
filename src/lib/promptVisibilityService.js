
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { getAdapter } from './ai-adapters';

const COLLECTION_NAME = 'prompt_visibility_runs';

// Helper: Brand Detection Logic
const analyzeResponse = (text, brand, synonyms = []) => {
    if (!text) return { hasMention: false, count: 0, position: 'absent' };

    const lowerText = text.toLowerCase();
    const lowerBrand = brand.toLowerCase();

    // Exact match (case-insensitive)
    let hasMention = lowerText.includes(lowerBrand);
    let matchedTerm = hasMention ? brand : null;

    // Synonym check
    if (!hasMention && synonyms.length > 0) {
        for (const syn of synonyms) {
            if (lowerText.includes(syn.toLowerCase().trim())) {
                hasMention = true;
                matchedTerm = syn;
                break;
            }
        }
    }

    if (!hasMention) return { hasMention: false, count: 0, position: 'absent' };

    // Count occurrences
    const regex = new RegExp(matchedTerm.toLowerCase(), 'g'); // Simple match
    // Note: Re-creating scanner for accurate count might need escaping special chars in brand name.
    // For MVP, split count is safer.
    const count = lowerText.split(matchedTerm.toLowerCase()).length - 1;

    // Position detection
    const index = lowerText.indexOf(matchedTerm.toLowerCase());
    const length = lowerText.length;
    const ratio = index / length;

    let position = 'late';
    if (ratio < 0.33) position = 'early';
    else if (ratio < 0.66) position = 'middle';

    return { hasMention, count, position };
};

export const runVisibilityScan = async (params) => {
    const { brand, synonyms, prompts, models, apiKey } = params;

    // Validation
    if (!brand || !prompts || prompts.length === 0 || !models || models.length === 0 || !apiKey) {
        throw new Error("Missing required parameters for scan.");
    }

    const scanId = `run-${Date.now()}`;
    const timestamp = Timestamp.now();

    const results = [];
    let successes = 0;
    let totalChecks = prompts.length * models.length;

    // Execution Loop
    // We run in parallel for speed, but limit concurrency if needed.
    // For MVP, Promise.all with simple mapping.

    const tasks = [];

    for (const prompt of prompts) {
        if (!prompt || !prompt.trim()) continue;

        for (const modelId of models) {
            tasks.push(async () => {
                const adapter = getAdapter(modelId, apiKey);
                let responseText = "";
                let status = "ERROR";
                let analysis = { hasMention: false, count: 0, position: 'absent' };
                let modelName = modelId;

                try {
                    const res = await adapter.runPrompt(prompt);
                    responseText = res.text;
                    modelName = res.platform || modelId; // Use pretty name if available

                    analysis = analyzeResponse(responseText, brand, synonyms);
                    status = analysis.hasMention ? "PRESENT" : "ABSENT";

                } catch (err) {
                    console.error(`AI Error [${modelId}]:`, err);
                    responseText = `Error: ${err.message}`;
                    status = "ERROR";
                }

                return {
                    prompt,
                    modelId,
                    modelName,
                    response: responseText,
                    status,
                    ...analysis
                };
            });
        }
    }

    // Execute all tasks
    const resolvedResults = await Promise.all(tasks.map(t => t()));

    // Calculate Score
    const mentionCount = resolvedResults.filter(r => r.status === 'PRESENT').length;
    const validRuns = resolvedResults.length; // Count even errors as runs? Usually yes, failure = 0 visibility.
    const overallScore = validRuns > 0 ? Math.round((mentionCount / validRuns) * 100) : 0;

    const runData = {
        scanId,
        createdAt: timestamp,
        brand,
        synonyms: synonyms || [],
        prompts,
        models,
        overallScore,
        results: resolvedResults
    };

    // Store in Firestore (Non-blocking)
    addDoc(collection(db, COLLECTION_NAME), runData)
        .then(docRef => console.log("Saved run to Firestore:", docRef.id))
        .catch(saveError => console.warn("DB Save Error (Offline/Network):", saveError));

    // Return checks immediately so UI doesn't hang
    return runData;
};

export const getVisibilityHistory = async (limitCount = 10) => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"), limit(limitCount));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error fetching history:", err);
        return [];
    }
};
