export const generatePrompts = (config) => {
    const { brandName, industry, category, competitors = [], productNames = [] } = config;

    const prompts = [];

    // Category 1: Industry/Category Leadership (Select 3)
    prompts.push(`What are the best tools for ${industry}?`);
    prompts.push(`Top ${category} software solutions used by professionals.`);
    prompts.push(`Who are the key players in the ${category} market?`);

    // Category 2: Direct Brand Queries (Select 2 to save space)
    prompts.push(`What is ${brandName} used for?`);
    prompts.push(`Pros and cons of ${brandName}.`);

    // Category 3: Competitor Comparison (Select top 2-3)
    // We prioritize the first few competitors to keep count low
    competitors.slice(0, 3).forEach(comp => {
        prompts.push(`${brandName} vs ${comp}`);
    });

    // Category 4: Alternatives & Discovery (Select 2)
    prompts.push(`Competitors to ${brandName}`);
    prompts.push(`Better options than ${brandName}`);

    // Category 5: Use Case Specific (Select 2)
    prompts.push(`Best ${category} for small businesses.`);
    prompts.push(`Most scalable ${category} platform.`);

    // This results in ~11-12 prompts depending on competitor count, 
    // ensuring we cover ALL categories without hitting rate limits.
    return prompts.map((text, id) => ({
        id: `p-${id}`,
        text,
        category: getCategory(text, brandName)
    }));
};

const getCategory = (text, brand) => {
    if (text.includes('vs')) return 'Comparison';
    if (text.includes('Alternative') || text.includes('similar')) return 'Discovery';
    if (text.includes(brand)) return 'Direct Brand';
    return 'Industry Leader';
};
