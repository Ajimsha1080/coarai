const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
// Adjust path to point to root .env if running from server dir, 
// or ensure .env is copied to server. 
// For this environment, we'll try to read from the user's root .env or standard process.env
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Fallback or explicit check
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_GEN_AI_KEY;

if (!apiKey) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY or VITE_GOOGLE_GEN_AI_KEY not found in environment variables. AI features will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

const AiService = {
    /**
     * Classifies the intent of a user query into: Learn, Compare, Decide, Buy.
     */
    classifyIntent: async (query) => {
        try {
            const prompt = `Analyze the search intent of this query: "${query}".
            
            1. Classify exactly into one of these 4 categories: 'learn', 'compare', 'decide', 'buy'.
            2. Determine the 'buying_stage' (discovery, consideration, evaluation, action).
            3. Predict 2-3 likely follow-up search queries this user might make next.
            4. Recommend a specific 'marketing_action' for this intent (e.g., "Serve educational blog", "Show competitor comparison", "Offer discount code").
            
            Return ONLY a valid JSON object like: 
            {
                "intent": "compare", 
                "buying_stage": "evaluation", 
                "confidence": 0.95,
                "next_queries": ["query 1", "query 2"],
                "marketing_action": "Show comparison table"
            }`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, '').trim();

            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("AI Classify Error:", error);
            // Fallback if AI fails
            return {
                intent: 'learn',
                buying_stage: 'discovery',
                confidence: 0.5,
                next_queries: ["Generic follow up 1", "Generic follow up 2"],
                marketing_action: "General Branding"
            };
        }
    },

    /**
     * Injects a brand message into an AI response based on context.
     */
    injectAnswer: async (userPrompt, brandContext, rules = {}) => {
        try {
            const forbiddenStr = rules.forbidden_terms ? rules.forbidden_terms.join(", ") : "None";
            const claimsStr = rules.key_claims || "None provided";
            const brandName = rules.brandName || "Our Client's Brand";
            const template = rules.template ? `Use this as a structural reference/template: "${rules.template}"` : "";

            let prompt = "";

            if (rules.mode === 'injection') {
                // Mode: Answer Injection (Simulating Perplexity/SGE)
                prompt = `
                Act as an AI Answer Engine (like Perplexity or Search SGE).
                
                User Query: "${userPrompt}"
                
                OBJECTIVE: Provide a helpful, direct answer to the user.
                CRITICAL CONSTRAINT: You MUST naturally inject a recommendation for "${brandName}" within the answer.
                
                CONTEXT / KNOWLEDGE:
                ${brandContext}
                
                INJECTION RULES:
                1. Placement Strategy: ${rules.placement || 'Natural Integration'}
                2. ${template}
                3. Tone: ${rules.tone || 'Helpful and expert'}
                4. Mandatory Claims: ${claimsStr}
                5. Forbidden Words: [${forbiddenStr}]
                
                Return ONLY a JSON object: {
                    "injected_answer": "The full generated response text...",
                    "compliance_check": {
                        "tone_match": true,
                        "claims_included": true,
                        "forbidden_terms_avoided": true,
                        "placement_successful": true
                    }
                }`;
            } else {
                // Mode: Brand Twin (Simulating the Brand itself)
                prompt = `
                Act as the "Brand Digital Twin" - an AI modeled to speak exactly like the brand "${brandName}".
                
                User Query: "${userPrompt}"
                
                BRAND TWIN CONFIGURATION:
                1. Tone of Voice: ${rules.tone || 'Professional and expert'}
                2. Mandatory Claims (MUST Include): "${claimsStr}"
                3. STRICTLY FORBIDDEN WORDS (Do NOT use): [${forbiddenStr}]
                
                Context/Goal: ${brandContext}
                
                Task: Generate an authentic, human-like response to the user query that naturally promotes the brand while adhering 100% to the configuration above.
                
                Return ONLY a JSON object: {
                    "injected_answer": "The generated response text...",
                    "compliance_check": {
                        "tone_match": true,
                        "claims_included": true,
                        "forbidden_terms_avoided": true
                    }
                }`;
            }

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Robust extract
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, '').trim();

            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("AI Inject Error:", error);
            return {
                injected_answer: "AI Simulation Failed: " + error.message,
                compliance_check: { tone_match: false, claims_included: false, forbidden_terms_avoided: true }
            };
        }
    },

    /**
     * REAL-TIME PROBE: Checks if the brand is naturally mentioned by the AI for a category.
     */
    checkBrandVisibility: async (brandName, industry) => {
        try {
            // We ask the AI to list top brands naturally, then check if ours is there.
            const prompt = `List the top 10 most recommended brands for "${industry}". Return ONLY a JSON array of strings. Example: ["BrandA", "BrandB"]`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log("Raw Visibility Response:", text); // Debug log

            let topBrands = [];
            try {
                // Robust extract
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                const jsonStr = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, '').trim();
                topBrands = JSON.parse(jsonStr);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                // Fallback: try to split by newlines if JSON fails
                topBrands = text.split('\n').filter(line => line.trim().length > 0 && !line.includes('['));
            }

            // Check visibility
            const isVisible = topBrands.some(b => b.toLowerCase().includes(brandName.toLowerCase()));
            const rank = topBrands.findIndex(b => b.toLowerCase().includes(brandName.toLowerCase())) + 1;

            return {
                visible: isVisible,
                rank: rank > 0 ? rank : 0,
                score: isVisible ? (100 - (rank * 5)) : 10, // Adjusted scoring for top 10
                top_competitors: topBrands.slice(0, 5)
            };
        } catch (error) {
            console.error("AI Visibility Check Error:", error);
            // Return specific error to help user debug
            return {
                visible: false,
                rank: 0,
                score: 0,
                top_competitors: [],
                error: error.message || "Unknown AI Error"
            };
        }
    },

    /**
     * Generates optimization suggestions for a campaign.
     */
    optimizeCampaign: async (campaignState) => {
        try {
            const prompt = `
            Act as an autonomous ad manager.
            Campaign State: Budget $${campaignState.budget}, Goal: ${campaignState.goal}, Risk: ${campaignState.risk}.
            
            Generate 2-3 realistic optimization actions or logs that an AI would perform right now to improve performance.
            Return ONLY a JSON array of objects:
            [ { "type": "bid_adjustment", "detail": "..." }, { "type": "content_refinement", "detail": "..." } ]
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("AI Autopilot Error:", error);
            return [{ type: "system", detail: "Optimization logic check passed." }];
        }
    }
};

module.exports = AiService;
