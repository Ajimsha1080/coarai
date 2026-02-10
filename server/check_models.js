const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.VITE_GOOGLE_GEN_AI_KEY;

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const axios = require('axios');

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Listing models via REST API...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        console.log("Available Models:");
        if (response.data && response.data.models) {
            response.data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models found in response:", response.data);
        }
    } catch (e) {
        console.error("Failed to list models:", e.response ? e.response.data : e.message);
    }
}

listModels();
