
import { BaseAdapter } from './baseAdapter';
import { resilientGeminiCall } from '../gemini';

export class GeminiAdapter extends BaseAdapter {
    constructor(apiKey, config) {
        super(apiKey, config);
        this.name = "Gemini 1.5/2.0";
        this.id = "gemini";
    }

    async runPrompt(prompt, context = {}) {
        try {
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                // Gemini is the default, native behavior
                systemInstruction: {
                    parts: [{ text: "You are a helpful AI assistant. Answer directly." }]
                }
            };

            const response = await resilientGeminiCall(this.apiKey, payload);
            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("Empty response from Gemini");

            return {
                text: this.cleanText(text),
                model: response.usedModel,
                platform: 'Gemini'
            };
        } catch (error) {
            console.error("Gemini Adapter Error:", error);
            throw new Error(error.message || "Gemini execution failed");
        }
    }
}
