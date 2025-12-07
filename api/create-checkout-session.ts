import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SK_LIVE || '', {
apiVersion: '2024-06-20',
});

export default async function handler(request: Request) {
const origin = new URL(request.url).origin;

const session = await stripe.checkout.sessions.create({
payment_method_types: ['card'],
mode: 'subscription',
line_items: [
{
price: 'price_1QuZmaG85r4wKmWWyR2wxy3R',
quantity: 1,
},
],
success_url: `${origin}/success`,
cancel_url: `${origin}/`,
});

return new Response(JSON.stringify({ sessionId: session.id }), {
status: 200,
headers: { 'Content-Type': 'application/json' },
});
}

export const config = {
runtime: 'edge',
};