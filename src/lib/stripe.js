import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe Publishable Key
// You can find this in your Stripe Dashboard (Developers > API keys)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_sample_key_replace_me';

let stripePromise;

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

/**
 * Initiates the checkout process for a given price ID.
 * @param {string} priceId - The Stripe Price ID (e.g., price_12345)
 */
export const handleCheckout = async (priceId) => {
    try {
        const stripe = await getStripe();
        if (!stripe) throw new Error("Stripe failed to initialize.");

        // 1. Call your backend to create a Checkout Session
        // const response = await fetch('/api/create-checkout-session', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ priceId }),
        // });
        // const session = await response.json();

        // 2. Redirect to Stripe Checkout
        // const result = await stripe.redirectToCheckout({
        //     sessionId: session.id,
        // });

        // if (result.error) {
        //     throw new Error(result.error.message);
        // }

        console.log(`Initiating checkout for price: ${priceId}`);
        alert("Stripe Integration Ready!\n\nTo complete the setup:\n1. Add your Backend Endpoint to create a session.\n2. Replace STRIPE_PUBLISHABLE_KEY in src/lib/stripe.js.\n3. Verify your Price IDs in Pricing.jsx.");

        return true;

    } catch (error) {
        console.error("Payment Error:", error);
        alert(`Payment failed: ${error.message}`);
        return false;
    }
};
