
import { resilientGeminiCall } from './gemini';

// CITATION INTELLIGENCE ENGINE
// Core logic for detecting, scoring, and fixing AI citations (GEO).

/**
 * AI-Powered Analysis:
 * Analyzes the AI response to determine if the brand is cited as an authority.
 * Uses a second pass LLM call to perform strict "Removability Tests" and classification.
 * 
 * @param {string} text - The AI response text to analyze
 * @param {string} brand - The target brand
 * @param {string} competitors - Competitor string
 * @param {string} apiKey - Gemini API Key
 * @returns {object} - Rich citation analysis
 */
export const analyzeCitationWithAI = async (text, brand, competitors, apiKey, platform = 'Gemini') => {
    if (!text || !brand) return {
        citation_level: 'NO_MENTION',
        confidence_score: 0,
        citation_sentence: null
    };

    // Construct the Analysis Prompt
    const analysisPrompt = `
    You are a Multi-Platform Citation Intelligence Engine for Generative Engine Optimization (GEO).

    Your task is to analyze AI-generated responses from MULTIPLE AI PLATFORMS
    and determine brand authority, citation presence, and trust consistency.

    THIS IS NOT SEO.
    THIS IS AI AUTHORITY ANALYSIS.

    ---

    ## INPUTS

    BRAND:
    ${brand}

    COMPETITORS:
    ${competitors || "None provided"}

    AI PLATFORM:
    ${platform}

    PROMPT CATEGORY:
    Definition/Comparison

    AI RESPONSE:
    ${text}

    ---

    ## STEP 1: ENTITY EXTRACTION
    Extract all mentions of:
    - The primary brand
    - Competitors
    - Generic unnamed sources

    ---

    ## STEP 2: CITATION CLASSIFICATION (STRICT)

    Classify the brand presence as EXACTLY ONE:

    1. NO_MENTION
    2. MENTION_ONLY
    3. WEAK_ATTRIBUTION
    4. STRONG_CITATION
    5. DEFINITION_OWNERSHIP

    Rules:
    - Mention ≠ Citation
    - Citation requires attribution of a claim or definition
    - Definition ownership is the strongest signal

    ---

    ## STEP 3: REMOVABILITY TEST (MANDATORY)

    For the attributed sentence:
    - Remove the brand name
    - If the sentence still makes sense → downgrade authority by one level

    Explain result briefly.

    ---

    ## STEP 4: CITATION TYPE (IF APPLICABLE)

    Label citation type as:
    - Definition
    - Explanation
    - Comparison
    - Recommendation
    - Source Reference

    Extract the exact sentence.

    ---

    ## STEP 5: PLATFORM TRUST SCORE (0–100)

    Score how much THIS PLATFORM trusts the brand based on:
    - Explicit attribution
    - Strength of language
    - Absence of competitors
    - Clarity and confidence

    Explain score in 1 sentence.

    ---

    ## STEP 6: PLATFORM-SPECIFIC AUTHORITY STATUS

    Label one:
    - TRUSTED_SOURCE
    - WEAKLY_TRUSTED
    - GENERIC_REFERENCE
    - NOT_TRUSTED

    ---

    ## STEP 7: COMPETITOR DISPLACEMENT CHECK

    Determine if:
    - Competitor is cited instead of the brand
    - Generic sources replace named authority

    Label:
    - AUTHORITY_GAIN
    - AUTHORITY_LOSS
    - AUTHORITY_NEUTRAL

    ---

    ## STEP 8: CROSS-PLATFORM NORMALIZATION (IMPORTANT)

    Based on THIS platform behavior, indicate:
    - Is this platform more willing to cite brands?
    - Is it conservative with attribution?
    - Does it favor generic explanations?

    (This allows fair comparison across platforms.)

    ---

    ## STEP 9: CITATION READINESS DIAGNOSIS (IF NOT STRONG)

    Explain WHY the brand was not cited on THIS platform:
    - Missing definition
    - Weak authority language
    - Competitor clarity advantage
    - Platform conservatism
    - High hallucination avoidance

    Provide ONE actionable fix.

    ---

    ## OUTPUT FORMAT (STRICT JSON)

    {
      "brand": "${brand}",
      "platform": "${platform}",
      "citation_level": "",
      "citation_type": "",
      "citation_sentence": "",
      "removability_passed": true,
      "platform_trust_score": 0,
      "platform_authority_status": "",
      "authority_change": "",
      "competitor_cited": "",
      "platform_bias_note": "",
      "why_not_cited": "",
      "recommended_fix": ""
    }
    `;

    try {
        const payload = {
            contents: [{ parts: [{ text: analysisPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        };

        const response = await resilientGeminiCall(apiKey, payload);
        const jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) throw new Error("Empty AI response");

        // Clean JSON text (remove markdown formatting if present)
        const cleanJson = jsonText.replace(/```json\n?|\n?```/g, "").trim();
        const result = JSON.parse(cleanJson);

        // Map new fields to legacy fields for frontend compatibility
        return {
            ...result,
            confidence_score: result.platform_trust_score || 0
        };

    } catch (error) {
        console.error("Citation Analysis Failed:", error);
        // Fallback: Use basic regex detection if AI analysis fails
        const legacy = detectCitationLegacy(text, brand);
        return {
            citation_level: legacy.isCited ? 'STRONG_CITATION' : (legacy.isMentioned ? 'MENTION_ONLY' : 'NO_MENTION'),
            confidence_score: legacy.confidence * 100,
            citation_sentence: legacy.sentence || null,
            why_not_cited: "AI Analysis Failed",
            recommended_fix: "Retry analysis"
        };
    }
};


/**
 * Calculates the Citation Authority Score (0-100).
 * Updated to use the new rich AI analysis data.
 * @param {Array} results - Array of prompt objects with .analysis property
 */
export const calculateAuthorityScore = (results) => {
    if (!results || results.length === 0) return 0;

    let totalScore = 0;

    results.forEach(res => {
        const analysis = res.analysis;
        if (!analysis) return;

        // Base score from the single analysis confidence
        let sampleScore = analysis.confidence_score || 0;

        // Bonues/Penalties
        if (analysis.citation_level === 'DEFINITION_OWNERSHIP') sampleScore += 10;
        if (analysis.citation_level === 'STRONG_CITATION') sampleScore += 5;
        if (analysis.citation_level === 'NO_MENTION') sampleScore = 0;

        // Cap at 100
        totalScore += Math.min(100, sampleScore);
    });

    // Average across all prompts
    return Math.round(totalScore / results.length);
};

// --- LEGACY REGEX FALLBACK (Kept for resilience) ---

const ATTRIBUTION_PATTERNS = [
    { regex: /according to\s+([A-Za-z0-9\s]+)/i, type: 'Explicit Source', weight: 1.0 },
    { regex: /([A-Za-z0-9\s]+)\s+states that/i, type: 'Direct Attribute', weight: 0.9 },
    { regex: /([A-Za-z0-9\s]+)\s+defines/i, type: 'Definition', weight: 1.0 },
    { regex: /([A-Za-z0-9\s]+)\s+explains/i, type: 'Explanation', weight: 0.8 },
    { regex: /as described by\s+([A-Za-z0-9\s]+)/i, type: 'Reference', weight: 0.9 },
    { regex: /based on\s+([A-Za-z0-9\s]+)\s+documentation/i, type: 'Documentation', weight: 0.95 },
    { regex: /([A-Za-z0-9\s]+)\s+recommends/i, type: 'Recommendation', weight: 0.7 },
    { regex: /source:\s+([A-Za-z0-9\s]+)/i, type: 'Structured Source', weight: 1.0 }
];

export const detectCitationLegacy = (text, brand) => {
    if (!text || !brand) return { isCited: false, confidence: 0 };

    const lowerText = text.toLowerCase();
    const lowerBrand = brand.toLowerCase();

    const mentionIndex = lowerText.indexOf(lowerBrand);
    if (mentionIndex === -1) {
        return { isCited: false, isMentioned: false, confidence: 0 };
    }

    const sentenceWindow = text.substring(Math.max(0, mentionIndex - 100), Math.min(text.length, mentionIndex + 100));

    const preBrandPatterns = [
        `according to ${lowerBrand}`, `as described by ${lowerBrand}`,
        `based on ${lowerBrand}`, `source: ${lowerBrand}`, `per ${lowerBrand}`
    ];

    const postBrandPatterns = [
        `${lowerBrand} states`, `${lowerBrand} defines`, `${lowerBrand} explains`,
        `${lowerBrand} recommends`, `${lowerBrand} suggests`, `${lowerBrand}'s definition`
    ];

    let matchedType = null;
    if (preBrandPatterns.some(p => lowerText.includes(p))) matchedType = 'Explicit Attribution';
    else if (postBrandPatterns.some(p => lowerText.includes(p))) matchedType = 'Active Voice Attribution';

    if (matchedType) {
        return {
            isCited: true,
            isMentioned: true,
            type: matchedType || 'General Citation',
            sentence: extractSentence(text, mentionIndex),
            confidence: 1.0
        };
    }

    return {
        isCited: false,
        isMentioned: true,
        type: 'Mention Only',
        sentence: extractSentence(text, mentionIndex),
        confidence: 0.5
    };
};

const extractSentence = (text, index) => {
    const start = text.lastIndexOf('.', index) + 1 || 0;
    const end = text.indexOf('.', index);
    return text.substring(start, end !== -1 ? end + 1 : text.length).trim();
};
