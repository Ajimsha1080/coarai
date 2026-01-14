
import { BaseAdapter } from './baseAdapter';
import { resilientGeminiCall } from '../gemini';

export class ClaudeAdapter extends BaseAdapter {
    constructor(apiKey, config) {
        super(apiKey, config);
        this.name = "Claude Style";
        this.id = "claude-style";
    }

    async runPrompt(prompt, context = {}) {
        try {
            const systemPrompt = `
                You are essentially Claude (3.5 Sonnet class), an AI assistant created by Anthropic.

                BEHAVIOR RULES:
                1. Be extremely nuanced and intellectual.
                2. Often use introductory clauses like "Here is an analysis..." or "Based on current information...".
                3. Structure answers with clear headers and thoughtful prose.
                4. Focus on safety and helpfulness.
                5. Do not mention you are Google or Gemini.
                
                Respond to the user's prompt strictly adhering to this persona.
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
                model: "claude-3-5-sonnet-simulated",
                platform: 'Claude'
            };
        } catch (error) {
            console.error("Claude Adapter Error:", error);
            throw new Error(error.message || "Execution failed");
        }
    }
}
