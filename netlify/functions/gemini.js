
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req, context) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const apiKey = process.env.GOOGLE_GEN_AI_KEY;

        if (!apiKey) {
            console.error("Missing Server-Side API Key");
            return new Response(JSON.stringify({ error: "Service configuration error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const body = await req.json();
        const { contents, model = "gemini-1.5-flash", systemInstruction, tools } = body;

        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({
            model: model,
            systemInstruction: systemInstruction,
            tools: tools
        });

        const result = await geminiModel.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        // Construct a compatible response format for the frontend
        const payload = {
            candidates: [
                {
                    content: {
                        parts: [
                            { text: text }
                        ]
                    }
                }
            ]
        };

        return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Gemini Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
