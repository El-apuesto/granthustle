import Stripe from "stripe";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SK_LIVE!, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: "price_1QuZmaG85r4wKmWWyR2wxy3R",
          quantity: 1,
        },
      ],
      success_url: "https://granthustle.org/dashboard?success=true",
      cancel_url: "https://granthustle.org/dashboard?canceled=true",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
