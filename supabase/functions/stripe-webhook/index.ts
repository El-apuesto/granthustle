import Stripe from "stripe";
import { supabaseClient } from "../_shared/supabaseClient";

export const stripeWebhook = async (req) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const data = event.data.object;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const supabase_user_id = data.metadata?.supabase_user_id;
      if (!supabase_user_id) return new Response("No user ID", { status: 400 });

      const status = data.status; // active, past_due, canceled...

      await supabaseClient
        .from("profiles")
        .update({
          subscription_status: status,
          subscription_tier: status === "active" ? "pro" : "free",
        })
        .eq("id", supabase_user_id);

      break;
    }

    case "invoice.payment_succeeded": {
      const supabase_user_id = data.metadata?.supabase_user_id;
      if (!supabase_user_id) return new Response("No user ID", { status: 400 });

      // Reset match counter each renewal
      await supabaseClient
        .from("profiles")
        .update({ monthly_matches_used: 0 })
        .eq("id", supabase_user_id);

      break;
    }
  }

  return new Response("ok", { status: 200 });
};
