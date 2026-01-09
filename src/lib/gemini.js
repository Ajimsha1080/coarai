const MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp"
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function resilientGeminiCall(apiKey, payload, maxRetries = 2) {
    let lastError = null;

    // Try each model in sequence
    for (const model of MODELS) {
        // Retry logic for each model
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    // Exponential backoff: 500ms, 1000ms, 2000ms...
                    await wait(500 * Math.pow(2, attempt));
                }

                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorText = await response.text();

                    // Handle rate limits (429) or Server Errors (5xx) by retrying or switching models
                    if (response.status === 429 || response.status >= 500) {
                        console.warn(`[Gemini] Model ${model} failed (Attempt ${attempt + 1}/${maxRetries + 1}). Status: ${response.status}`);
                        lastError = new Error(`Gemini ${model} Error ${response.status}: ${errorText}`);

                        // If it's a rate limit, we might want to try the same model again after backoff,
                        // UNLESS we are out of retries, then switch model.
                        if (attempt < maxRetries) continue;
                        else break; // Switch to next model
                    }

                    // For 400 (Bad Request) or 401 (Unauthorized), fail immediately (don't retry)
                    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
                }

                const data = await response.json();

                // Check for blocked content
                if (data.promptFeedback?.blockReason) {
                    throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
                }

                // Inject metadata about which model succeeded
                data.usedModel = model;
                return data;

            } catch (error) {
                console.warn(`[Gemini] Error with ${model}:`, error.message);
                lastError = error;
                // If it's a fatal error (like 400), stop retrying this model
                if (error.message.includes("400") || error.message.includes("401")) {
                    throw error;
                }
            }
        }
    }

    throw lastError || new Error("All Gemini models failed to respond.");
}
