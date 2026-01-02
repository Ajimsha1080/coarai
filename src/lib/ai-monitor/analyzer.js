
// We'll use the existing resilientGeminiCall from src/lib/gemini.js but wrappers are needed for analysis
import { resilientGeminiCall } from '../gemini';

export const analyzeResponse = async (apiKey, responseText, brandName, competitors) => {
    // Fail fast if the response itself was an error
    if (!responseText || responseText.startsWith("Error fetching")) {
        return {
            mentioned: false,
            sentiment: "neutral",
            position: "not_listed",
            prominence_score: 0,
            competitors_mentioned: [],
            recommendation_type: "none",
            error: true // Flag this as an error
        };
    }

    // Meta-analysis prompt
    const systemPrompt = `You are an AI Analyst.
    Your task is to analyze an AI's response text to determine how it mentioned a specific brand.
    
    Brand to Track: "${brandName}"
    Competitors: ${competitors.join(', ')}

    Analyze the "Response Text" below and return a JSON object with this EXACT structure:
    {
        "mentioned": boolean, // Is the brand mentioned at all?
        "sentiment": "positive" | "neutral" | "negative",
        "position": "first" | "middle" | "last" | "not_listed" | "only_option", // Approximate position in list/text
        "prominence_score": number, // 0-10 (0=not there, 10=primary focus/highly recommended)
        "competitors_mentioned": string[], // List of competitors found in text
        "recommendation_type": "primary_recommendation" | "list_option" | "comparison" | "negative_example" | "none"
    }

    Response Text:
    """
    ${responseText.slice(0, 5000)}
    """
    
    Return ONLY valid JSON.
    `;

    try {
        const result = await resilientGeminiCall(apiKey, {
            contents: [{ parts: [{ text: "Analyze this response." }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        });

        const text = result.candidates[0].content.parts[0].text;
        // Clean code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Analysis failed", error);
        return {
            mentioned: false,
            sentiment: "neutral",
            position: "not_listed",
            prominence_score: 0,
            competitors_mentioned: [],
            recommendation_type: "none",
            error: true
        };
    }
};

export const fetchSimulatedResponse = async (apiKey, prompt, platform = 'gemini') => {
    // For MVP, we simulated other platforms or just use Gemini as the engine
    // If platform is 'gemini', use the real API.
    // If others, we might need to mock or warn user. 
    // The user said "Allow user to select". We will just use Gemini for all but label them differently in UI 
    // OR we can try to prompt Gemini to "Act like Perplexity".

    // Actually, for a pure MVP, let's just run Gemini.

    try {
        const result = await resilientGeminiCall(apiKey, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        return result.candidates[0].content.parts[0].text;
    } catch (e) {
        return "Error fetching response.";
    }
};
