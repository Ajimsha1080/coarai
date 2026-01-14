export const generatePrompts = (config) => {
    const { brandName, category, competitors = [], productType = 'SaaS' } = config;

    const prompts = [];

    // --- TEMPLATE LOGIC BY PRODUCT TYPE ---
    switch (productType) {
        case 'FMCG': // Consumer Product (Food / FMCG)
            // 1. Direct Usage & Benefits
            prompts.push(`What is ${brandName} used for?`);
            prompts.push(`Is ${brandName} healthy?`);

            // 2. Category Leaderboards (Consumer Language)
            prompts.push(`Best ${category} for kids`);
            prompts.push(`Top rated ${category} brands`);

            // 3. Comparisons
            competitors.slice(0, 2).forEach(comp => {
                prompts.push(`${brandName} vs ${comp}`);
            });

            // 4. Specific FMCG Concerns
            prompts.push(`${brandName} ingredients list`);
            prompts.push(`Is ${brandName} good for daily consumption?`);
            break;

        case 'Healthcare':
            prompts.push(`What is ${brandName} used to treat?`);
            prompts.push(`${brandName} side effects`);
            prompts.push(`Is ${brandName} safe?`);
            prompts.push(`Best alternatives to ${brandName}`);
            competitors.slice(0, 2).forEach(comp => prompts.push(`${brandName} vs ${comp}`));
            break;

        case 'Finance':
            prompts.push(`Is ${brandName} safe to use?`);
            prompts.push(`${brandName} fees and charges`);
            prompts.push(`Best ${category} for beginners`);
            prompts.push(`${brandName} reviews`);
            competitors.slice(0, 2).forEach(comp => prompts.push(`${brandName} vs ${comp}`));
            break;

        case 'Education':
            prompts.push(`Is ${brandName} worth it?`);
            prompts.push(`Best ${category} courses for career growth`);
            prompts.push(`${brandName} success stories`);
            competitors.slice(0, 2).forEach(comp => prompts.push(`${brandName} vs ${comp}`));
            break;

        case 'Local':
            prompts.push(`Best ${category} near me`);
            prompts.push(`${brandName} reviews`);
            prompts.push(`Is ${brandName} open now?`);
            competitors.slice(0, 2).forEach(comp => prompts.push(`${brandName} vs ${comp}`));
            break;

        case 'SaaS':
        default:
            // Original SaaS Logic
            prompts.push(`What are the best  ${category} solutions?`);
            prompts.push(`Top ${category} software solutions used by professionals.`);
            prompts.push(`Who are the key players in the ${category} market?`);
            prompts.push(`What is ${brandName} used for?`);
            prompts.push(`Pros and cons of ${brandName}.`);
            competitors.slice(0, 3).forEach(comp => {
                prompts.push(`${brandName} vs ${comp}`);
            });
            prompts.push(`Competitors to ${brandName}`);
            prompts.push(`Better options than ${brandName}`);
            prompts.push(`Best ${category} for small businesses.`);
            break;
    }

    // --- VALIDATION & FILTERING ---
    // Remove prompts that violate the rules for specific types
    const filteredPrompts = prompts.filter(text => {
        const lowerText = text.toLowerCase();

        // Rule: FMCG should NOT have software terms
        if (productType === 'FMCG') {
            const forbidden = ['tool', 'software', 'platform', 'solution', 'vendor'];
            if (forbidden.some(word => lowerText.includes(word))) {
                console.warn(`[Prompt Engine] Blocked invalid prompt for FMCG: "${text}"`);
                return false;
            }
        }

        return true;
    });

    return filteredPrompts.map((text, id) => ({
        id: `p-${id}`,
        text,
        category: getCategory(text, brandName)
    }));
};

const getCategory = (text, brand) => {
    const t = text.toLowerCase();
    if (t.includes('vs')) return 'Comparison';
    if (t.includes('alternative') || t.includes('option') || t.includes('competitor')) return 'Discovery';
    if (t.includes(brand.toLowerCase())) return 'Direct Brand';
    return 'Industry Leader'; // Default
};
