
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), ".env");
let apiKey = "";
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        if (line.trim().startsWith('VITE_GOOGLE_GEN_AI_KEY=')) {
            apiKey = line.split('=')[1].trim();
        }
    });
} catch (e) {
    console.error("Error reading .env");
}

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}
// Clean key
if (apiKey.startsWith('"') || apiKey.startsWith("'")) apiKey = apiKey.slice(1, -1);

console.log("Testing with API Key:", apiKey.substring(0, 5) + "...");

const MODELS = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
];

async function testGeneration() {
    for (const model of MODELS) {
        console.log(`\nTesting Model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: "Hello, explain who you are in one sentence." }] }]
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`FAILED (${response.status}): ${text}`);
            } else {
                const data = await response.json();
                console.log("SUCCESS!");
                console.log("Response:", data.candidates?.[0]?.content?.parts?.[0]?.text || "No text");
                return; // Stop on first success
            }
        } catch (e) {
            console.error("Network/Fetch Error:", e.message);
        }
    }
}

testGeneration();
