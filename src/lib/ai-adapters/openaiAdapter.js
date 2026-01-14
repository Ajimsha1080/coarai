
import { BaseAdapter } from './baseAdapter';
import { resilientGeminiCall } from '../gemini';

export class OpenAiAdapter extends BaseAdapter {
    constructor(apiKey, config) {
        super(apiKey, config);
        this.name = "ChatGPT Style";
        this.id = "openai-style";
    }

    // Since we don't have a live OpenAI key in this environment yet,
    // we use Gemini with a strict persona to simulate ChatGPT's behavior.
    async runPrompt(prompt, context = {}) {
        try {
            const systemPrompt = `
                You are essentially ChatGPT (GPT-4 class), an AI assistant created by OpenAI.
                
                BEHAVIOR RULES:
                1. Be concise and conversational.
                2. Use bullet points frequently.
                3. Do not mention you are Google or Gemini.
                4. Match the tone of a helpful, neutral assistant.
                5. If asked about brands, provide standard, popular list-based answers.
                
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
                model: "gpt-4o-simulated",
                platform: 'ChatGPT'
            };
        } catch (error) {
            console.error("OpenAI Adapter Error:", error);
            throw new Error(error.message || "Execution failed");
        }
    }
}
