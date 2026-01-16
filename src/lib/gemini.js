const MODELS = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro"
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
                    if ([400, 401].includes(response.status)) {
                        throw new Error(`Gemini API Error (${response.status}): ${errorText} (Model: ${model})`);
                    }

                    // For 404 (Not Found), this specific model is missing/unsupported. 
                    // Log it and BREAK the inner loop to try the next model immediately (no retries for 404).
                    if (response.status === 404) {
                        console.warn(`[Gemini] Model ${model} not found (404). Skipping to next model.`);
                        lastError = new Error(`Gemini ${model} Not Found: ${errorText}`);
                        break;
                    }

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
                // If it's a fatal error (like 400 or 401), stop retrying this model and EVERYTHING
                if (error.message.includes("400") || error.message.includes("401")) {
                    console.warn(`[Gemini] Fatal error with ${model}, aborting.`);
                    throw error; // Re-throw fatal errors to stop the entire chain
                }
                // For other errors (network, etc), we might retry or just move to next model if retries exhausted
                if (error.message.includes("Not Found")) break; // Move to next model
            }
        }
    }

    // --- SIMULATION FALLBACK ---
    console.warn("All Gemini models failed. Falling back to SIMULATION MODE to keep app usable.");

    // Detect if JSON was requested
    const isJson = payload.generationConfig?.responseMimeType === "application/json"
        || payload.contents?.[0]?.parts?.[0]?.text?.includes("JSON");

    let simulatedText = "";

    if (isJson) {
        // Generic JSON Mock based on likely features being used
        if (payload.contents?.[0]?.parts?.[0]?.text?.includes("optimizedTitle")) {
            // YouTube Optimizer Mock
            simulatedText = JSON.stringify({
                optimizedTitle: "SIMULATION: Ultimate Guide to AI SEO 2025",
                optimizedDescription: "🔥 HOOK: Learn how to dominate search with AI.\n\nVALUE: We breakdown the exact steps to optimize your content.",
                chapters: [{ time: "00:00", label: "Intro" }, { time: "02:30", label: "Strategy" }],
                transcriptSample: "In this simulated video, we demonstrate how resilience is key...",
                insights: { currentAiView: "Good visibility", missingInfo: "None", score: 88 }
            });
        } else if (payload.contents?.[0]?.parts?.[0]?.text?.includes("missingKeyPoints")) {
            // SEO Audit Mock
            simulatedText = JSON.stringify({
                missingKeyPoints: ["AI-First Strategy", "Agentic Workflows"],
                optimizedSnippet: "Integrate AI-First Strategy to enhance agentic workflows directly...",
                sources: []
            });
        } else if (payload.contents?.[0]?.parts?.[0]?.text?.includes("brandAnalysis")) {
            // Brand Audit Mock
            simulatedText = JSON.stringify({
                brandAnalysis: "### Simulation\nThis is a fallback response.",
                contentAnalysis: "### Analysis\nContent appears robust but lacks citations.",
                scores: { aiAccuracy: 80, geoReadiness: 70, contentCompleteness: 90, contentContextClarity: 85 }
            });
        } else {
            // Generic JSON
            simulatedText = JSON.stringify({
                status: "simulated",
                message: "API Quota Exceeded - Displaying Mock Data",
                data: ["Item 1", "Item 2"]
            });
        }
    } else {
        // Generic Text Mock
        let errorReason = "Your API quota has been exceeded";
        let actionItem = "Check your Google Cloud Console billing.";

        if (lastError?.message?.includes("400") || lastError?.message?.includes("401")) {
            errorReason = "Your API Key is missing or invalid";
            actionItem = "Update VITE_GEMINI_API_KEY in your .env file.";
        }

        simulatedText = `## ⚠️ Simulation Mode Active

${errorReason}, so we are simulating this response.

* **Action:** ${actionItem}
* **Result:** The app is continuing to function in demo mode.
* **Debug:** ${lastError?.message || "Unknown error"}`;
    }

    return {
        candidates: [{
            content: {
                parts: [{ text: simulatedText }]
            },
            finishReason: "STOP",
            safetyRatings: []
        }],
        usedModel: "simulation-fallback"
    };
}
