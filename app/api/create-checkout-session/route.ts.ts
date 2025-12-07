// app/api/create-checkout-session/route.ts

// THIS LINE IS THE ONLY ONE ADDED — it forces no caching forever
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK_LIVE!, {
  apiVersion: "2024-06-20",
});

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1QuZmaG85r4wKmWWyR2wxy3R",
          quantity: 1,
        },
      ],
      success_url: "https://granthustle.org/dashboard?success=true",
      cancel_url: "https://granthustle.org/dashboard?canceled=true",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
