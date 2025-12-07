// api/create-checkout-session.ts
// Fixed for Vercel deployment – Node.js runtime + working redirect

import Stripe from "stripe";

// Server-only secret key (never exposed to client)
const stripe = new Stripe(process.env.STRIPE_SK_LIVE!, {
  apiVersion: "2024-06-20",
});

export default async function handler(request: Request) {
  try {
    // Detect origin dynamically (works locally + in production)
    const origin = new URL(request.url).origin;

    // Create a subscription checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1QuZmaG85r4wKmWWyR2wxy3R", // your Stripe price ID
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
    });

    // Instantly redirect to Stripe-hosted checkout
    return Response.redirect(session.url!, 303);
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ✅ Use Node.js runtime so Stripe SDK works on Vercel
export const config = {
  runtime: "nodejs",
};
