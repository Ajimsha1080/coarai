const MODELS = [
    "gemini-2.0-flash-exp",   // EXPERIMENTAL - Verified as working for this user (despite 429s)
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-1.0-pro"          // Added 1.0 specific
];

export const resilientGeminiCall = async (apiKey, payload, modelIndex = 0, retryWithoutTools = false, retries = 0) => {
    // 1. If we've tried all models with tools and failed, AUTOMATICALLY retry without Search Tools
    if (modelIndex >= MODELS.length) {
        if (!retryWithoutTools && payload.tools) {
            console.warn("All models failed with Search Tools. Retrying without Search to ensure response...");
            const newPayload = { ...payload };
            delete newPayload.tools; // Remove search requirement
            return resilientGeminiCall(apiKey, newPayload, 0, true);
        }
        throw new Error("All models failed. Please check: 1) Your API Key usage limit 2) Google Search availability in your region.");
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

        // Specific handling for 429 (Quota)
        if (response.status === 429) {
            if (retries < 3) {
                // If it's a 429, it means the model EXISTS but is busy. 
                // Since other models are giving 404s, we MUST stick to this one and wait.
                const waitTime = (retries + 1) * 2000; // 2s, 4s, 6s
                console.warn(`[Gemini] ${model} hit rate limit (429). Waiting ${waitTime}ms and retrying...`);

                await new Promise(resolve => setTimeout(resolve, waitTime));
                return resilientGeminiCall(apiKey, payload, modelIndex, retryWithoutTools, retries + 1);
            }
            // If we exhausted retries, verify if we should switch or if this is the only working model
            console.warn(`[Gemini] ${model} exhausted retries. Switching...`);
            return resilientGeminiCall(apiKey, payload, modelIndex + 1, retryWithoutTools, 0);
        }

        // 503 (Overloaded) - Switch immediately
        if (response.status === 503) {
            console.warn(`[Gemini] ${model} hit 503. Switching...`);
            return resilientGeminiCall(apiKey, payload, modelIndex + 1, retryWithoutTools, 0);
        }

        // 404 means Model Not Found (e.g. alias not valid for this key/region) -> Switch immediately
        if (response.status === 404) {
            console.warn(`[Gemini] ${model} returned 404 (Not Found). Switching...`);
            return resilientGeminiCall(apiKey, payload, modelIndex + 1, retryWithoutTools, 0);
        }

        if (response.status === 403 || response.status === 400) {
            const errorBody = await response.json().catch(() => ({}));
            const msg = errorBody.error?.message || "";
            if (msg.includes("API key") || response.status === 403) {
                // If Key is invalid, NO model will work. Fail fast.
                throw new Error("API Key Invalid or Expired. Please check your Netlify Environment Variables.");
            }
        }

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const errorMessage = errorBody.error?.message || 'Unknown error';
            console.error(`[Gemini] Error (${model}): ${response.status} - ${errorMessage}`);
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

        // If this was the last model, throw the REAL error so the user knows what happened
        // (unless we haven't tried removing tools yet)
        if (modelIndex === MODELS.length - 1 && (retryWithoutTools || !payload.tools)) {
            // Give a useful error message to the user
            const finalMsg = error.message.includes("429") ? "API Quota Exceeded (Try again later)"
                : error.message.includes("API Key") ? error.message
                    : `Analysis Failed: ${error.message}`;
            throw new Error(finalMsg);
        }

        // Recursively try the next model
        return resilientGeminiCall(apiKey, payload, modelIndex + 1, retryWithoutTools, 0);
    }
};
