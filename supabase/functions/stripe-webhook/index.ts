import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16",
});

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const text = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      text,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const data = event.data.object;
  const userId = data.metadata?.supabase_user_id;

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      await supabase
        .from("profiles")
        .update({
          subscription_status: data.status,
          subscription_tier: data.status === "active" ? "pro" : "free",
        })
        .eq("id", userId);
      break;
    }

    case "invoice.payment_succeeded": {
      await supabase
        .from("profiles")
        .update({ monthly_matches_used: 0 })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      await supabase
        .from("profiles")
        .update({
          subscription_status: "canceled",
          subscription_tier: "free",
        })
        .eq("id", userId);
      break;
    }
  }

  return new Response("ok", { status: 200 });
});
