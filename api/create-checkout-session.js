// api/create-checkout-session.js
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { 
      apiVersion: "2022-11-15" 
    });

    const { priceId, userId } = req.body || {};
    const chosenPriceId = priceId || process.env.STRIPE_PRICE_ID_PRO;

    if (!chosenPriceId) {
      return res.status(400).json({ error: "Missing price id" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: chosenPriceId, quantity: 1 }],
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/`,
      metadata: { supabase_user_id: userId || "none" },
    });

    // FIXED: Return the URL instead of just the ID
    return res.status(200).json({ 
      url: session.url,
      id: session.id 
    });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ 
      error: err.message || "internal_error" 
    });
  }
}
