const MODELS = [
    "gemini-1.5-flash",     // STANDARD - Stable & Fast
    "gemini-2.0-flash-exp", // EXPERIMENTAL - Fastest but volatile
    "gemini-1.5-pro"        // FALLBACK - High quality, slower
];

export const resilientGeminiCall = async (apiKey, payload, modelIndex = 0, retryWithoutTools = false) => {
    // 1. If we've tried all models with tools and failed, AUTOMATICALLY retry without Search Tools
    if (modelIndex >= MODELS.length) {
        if (!retryWithoutTools && payload.tools) {
            console.warn("All models failed with Search Tools. Retrying without Search to ensure response...");
            const newPayload = { ...payload };
            delete newPayload.tools; // Remove search requirement
            return resilientGeminiCall(apiKey, newPayload, 0, true);
        }
        throw new Error("All Gemini models failed or quota exceeded.");
    }

    const model = MODELS[modelIndex];
    // Use v1beta for access to tools/grounding features
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        console.log(`[Gemini] Attempting ${model} (Tools: ${!!payload.tools})...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Specific handling for 429 (Quota) and 503 (Overloaded)
        if (response.status === 429 || response.status === 503) {
            console.warn(`[Gemini] ${model} hit status ${response.status}. Switching...`);
            return resilientGeminiCall(apiKey, payload, modelIndex + 1, retryWithoutTools);
        }

        if (response.status === 403 || response.status === 400) {
            const errorBody = await response.json().catch(() => ({}));
            const msg = errorBody.error?.message || "";
            if (msg.includes("API key") || response.status === 403) {
                throw new Error("API_KEY_INVALID");
            }
        }

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const errorMessage = errorBody.error?.message || 'Unknown error';
            console.error(`[Gemini] Error (${model}): ${response.status} - ${errorMessage}`);

            // If the error explicitly mentions "tools not supported" or similar, we should probably fail fast or retry next
            // For now, robustly try the next model
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error(`No candidates returned from ${model}`);
        }

        console.log(`[Gemini] Success with ${model}`);
        return { ...data, usedModel: model };

    } catch (error) {
        console.error(`[Gemini] Failed with ${model}:`, error);
        // Recursively try the next model
        return resilientGeminiCall(apiKey, payload, modelIndex + 1, retryWithoutTools);
    }
};
