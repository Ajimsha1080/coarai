
import { GeminiAdapter } from './geminiAdapter';
import { OpenAiAdapter } from './openaiAdapter';
import { ClaudeAdapter } from './claudeAdapter';
import { PerplexityAdapter } from './perplexityAdapter';

// Factory to get the correct adapter
export const getAdapter = (platformId, apiKey) => {
    switch (platformId) {
        case 'openai-style':
            return new OpenAiAdapter(apiKey);
        case 'claude-style':
            return new ClaudeAdapter(apiKey);
        case 'perplexity-style':
            return new PerplexityAdapter(apiKey);
        case 'gemini':
        default:
            return new GeminiAdapter(apiKey);
    }
};

export const AVAILABLE_PLATFORMS = [
    { id: 'gemini', name: 'Gemini (Recommended)', description: 'Fast, native reasoning', badge: 'Default' },
    { id: 'openai-style', name: 'ChatGPT Style', description: 'Concise, conversational', badge: 'Simulated' },
    { id: 'claude-style', name: 'Claude Style', description: 'Nuanced, detailed', badge: 'Simulated' },
    { id: 'perplexity-style', name: 'Perplexity Style', description: 'Citation-focused', badge: 'Simulated' },
];
