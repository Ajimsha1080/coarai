
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Base Interface for all AI Adapters
export class BaseAdapter {
    constructor(apiKey, config = {}) {
        this.apiKey = apiKey;
        this.config = config;
        this.name = "Base Adapter";
        this.id = "base";
    }

    async runPrompt(prompt, context = {}) {
        throw new Error("runPrompt must be implemented by subclass");
    }

    // Common helper to clean text
    cleanText(text) {
        if (!text) return "";
        return text.trim();
    }
}
