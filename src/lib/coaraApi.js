const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

export const CoaraApi = {
    // Brand
    createBrand: (data) => request('/brand/create', { method: 'POST', body: JSON.stringify(data) }),
    getBrandTwin: (id) => request(`/brand/${id}/twin`),
    updateBrandTwin: (id, data) => request(`/brand/${id}/twin`, { method: 'POST', body: JSON.stringify(data) }),

    // Campaign
    createCampaign: (data) => request('/campaign/create', { method: 'POST', body: JSON.stringify(data) }),
    runAutopilot: (data) => request('/campaign/autopilot/run', { method: 'POST', body: JSON.stringify(data) }),

    // Intelligence
    classifyIntent: (query) => request('/intelligence/classify', { method: 'POST', body: JSON.stringify({ query }) }),
    getInfluenceScore: (brandId) => request(`/intelligence/score?brand_id=${brandId}`),
    injectAnswer: (data) => request('/intelligence/inject', { method: 'POST', body: JSON.stringify(data) })
};
