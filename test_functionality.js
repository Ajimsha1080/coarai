
// Native fetch is available in Node 25
async function testEndpoints() {
    const baseUrl = 'http://localhost:3001/api';
    console.log("Starting API Functionality Tests...\n");

    // 1. Test Intent Classification
    try {
        console.log("1. Testing Intent Classification...");
        const res = await fetch(`${baseUrl}/intelligence/classify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'best crm software for startups' })
        });
        const data = await res.json();

        if (data.intent) {
            console.log("   ✅ SUCCESS: " + data.intent);
            console.log("   --> Next Queries: " + JSON.stringify(data.next_queries));
            console.log("   --> Action: " + data.marketing_action);
        }
        else console.log("   ❌ FAILED: " + JSON.stringify(data));
    } catch (e) {
        console.log("   ❌ ERROR:", e.message);
    }
    console.log("-----------------------------------");

    // 2. Test Brand Visibility (Influence Score)
    try {
        console.log("2. Testing Brand Visibility (Real-time Probe)...");
        // Using a real brand to test visibility
        const res = await fetch(`${baseUrl}/intelligence/score?brand_id=123&brandName=Salesforce&industry=CRM Software`);
        const data = await res.json();

        if (data.overall_score !== undefined) {
            console.log("   ✅ SUCCESS: Score " + data.overall_score);
            console.log("   --> Competitors: " + JSON.stringify(data.top_competitors));
        }
        else console.log("   ❌ FAILED: " + JSON.stringify(data));
    } catch (e) {
        console.log("   ❌ ERROR:", e.message);
    }
    console.log("-----------------------------------");

    // 3. Test Live Answer Injection (Brand Twin)
    try {
        console.log("3. Testing Live Answer Injection (Brand Twin)...");
        const res = await fetch(`${baseUrl}/intelligence/inject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_prompt: 'Why is your product good?',
                context: 'A premium product pitch.',
                rules: {
                    tone: 'Professional',
                    forbidden_terms: ['cheap', 'affordable'],
                    key_claims: 'Enterprise grade security'
                }
            })
        });
        const data = await res.json();

        if (data.injected_answer) {
            console.log("   ✅ SUCCESS: Answer generated");
            console.log("   --> Compliance: ", JSON.stringify(data.compliance_check));
        }
        else console.log("   ❌ FAILED");
    } catch (e) {
        console.log("   ❌ ERROR:", e.message);
    }

    // 3b. Testing Answer Injection (Perplexity Mode)
    try {
        console.log("3b. Testing Answer Injection (Perplexity Mode)...");
        const res = await fetch(`${baseUrl}/intelligence/inject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_prompt: 'What is a good CRM?',
                context: 'Coarai is a CRM.',
                rules: {
                    mode: 'injection',
                    brandName: 'Coarai',
                    placement: 'Top Recommendation'
                }
            })
        });
        const data = await res.json();

        if (data.injected_answer && data.compliance_check.placement_successful !== undefined) {
            console.log("   ✅ SUCCESS: Injection generated");
            console.log("   --> Placement Successful: " + data.compliance_check.placement_successful);
        }
        else console.log("   ❌ FAILED: " + JSON.stringify(data));
    } catch (e) {
        console.log("   ❌ ERROR:", e.message);
    }
    console.log("-----------------------------------");

    // 4. Test Campaign Autopilot
    try {
        console.log("4. Testing Campaign Autopilot...");
        const res = await fetch(`${baseUrl}/campaign/autopilot/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaign_id: 'test-camp',
                action: 'optimize',
                current_state: { budget: 1000, goal: 'Leads', risk: 'Low' }
            })
        });
        const data = await res.json();

        if (data.success && data.optimizations) console.log("   ✅ SUCCESS: Optimizations generated");
        else console.log("   ❌ FAILED");
    } catch (e) {
        console.log("   ❌ ERROR:", e.message);
    }
    console.log("\nTests Completed.");
}

testEndpoints();
