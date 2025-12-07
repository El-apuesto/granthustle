// /api/create-checkout-session.ts

import Stripe from "stripe";
import { VITE_STRIPE_SECRET_KEY } from "$env/static/private";

export const POST = async (req) => {
  try {
    const { userId } = await req.json();

    const stripe = new Stripe(VITE_STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_XXXXX", // your monthly subscription price id
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        supabase_user_id: userId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe session error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
