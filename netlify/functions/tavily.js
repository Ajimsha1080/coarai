
export default async (req, context) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // Get key from environment (support both standard and VITE_ prefixed)
        const apiKey = process.env.TAVILY_API_KEY || process.env.VITE_TAVILY_API_KEY;

        if (!apiKey) {
            console.error("Missing Server-Side Tavily API Key");
            return new Response(JSON.stringify({ error: "Search service configuration error: Missing API Key" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const body = await req.json();
        const { query } = body;

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "advanced",
                include_answer: true,
                max_results: 5
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tavily API responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Tavily Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
