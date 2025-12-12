const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  basic: "price_1Sa8yzG85r4wkmwW8CGlyij4",
  standard: "price_1Sa918G85r4wkmwW786cBMaH",
  pro: "price_1Sa9BPG85r4wkmwWd0BQE2vz",
  enterprise: "price_1SbWyQG85r4wkmwWKFT2dwlf",
};

app.post("/checkout", async (req, res) => {
  const { tier } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICES[tier], quantity: 1 }],
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

app.listen(4242, () => console.log("Server running on :4242"));
