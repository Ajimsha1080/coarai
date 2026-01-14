
import { BaseAdapter } from './baseAdapter';
import { resilientGeminiCall } from '../gemini';

export class PerplexityAdapter extends BaseAdapter {
    constructor(apiKey, config) {
        super(apiKey, config);
        this.name = "Perplexity Style";
        this.id = "perplexity-style";
        // We use the Tavily Key if available for real citations, 
        // but for this MVP adapter we rely on Gemini's ground capabilities if keys are missing
    }

    async runPrompt(prompt, context = {}) {
        try {
            const systemPrompt = `
                You are essentially Perplexity AI, a search-native answer engine.

                BEHAVIOR RULES:
                1. Focus strictly on current facts and comparisons.
                2. MUST include [1], [2], [3] style citations in the text (simulate them if real search isn't active).
                3. Be direct and objective.
                4. List sources at the end if possible.
                5. Do not mention you are Google or Gemini.

                Structure:
                - Concise Answer
                - Detailed Breakdown
                - Sources
            `;

            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            const response = await resilientGeminiCall(this.apiKey, payload);
            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("Empty response from Model");

            return {
                text: this.cleanText(text),
                model: "sonar-online-simulated",
                platform: 'Perplexity'
            };
        } catch (error) {
            console.error("Perplexity Adapter Error:", error);
            throw new Error(error.message || "Execution failed");
        }
    }
}
