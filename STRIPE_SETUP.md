# Stripe Checkout Integration Setup

This PR adds Supabase Edge Functions to handle Stripe checkout sessions. Follow these steps to complete the setup:

## 1. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API Keys**
3. Copy your **Secret Key** (starts with `sk_live_` or `sk_test_`)

## 2. Add Environment Variables to Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings > Edge Functions**
3. Click **Add secrets**
4. Add the following:
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your Stripe Secret Key (from step 1)

## 3. Update Your Domain in PricingPage.tsx

In `src/components/PricingPage.tsx`, find this line:

```typescript
const res = await fetch(
  'https://YOUR_SUPABASE_URL/functions/v1/create-checkout-session',
  ...
);
```

Replace `YOUR_SUPABASE_URL` with your actual Supabase URL. You can find it in:
- Supabase Dashboard > Settings > API
- It looks like: `https://xxxxxxxxxxxx.supabase.co`

## 4. Update Stripe Price IDs in PricingPage.tsx

In `src/components/PricingPage.tsx`, update the `PRICE_IDS` object:

```typescript
const PRICE_IDS = {
  intro: 'price_xxxxxxxxxxxxx',    // Your $9.99/month intro price ID
  season: 'price_xxxxxxxxxxxxx',   // Your $79.99 season pass price ID
  annual: 'price_xxxxxxxxxxxxx',   // Your $149.99 annual price ID
};
```

To find your price IDs:
1. Go to Stripe Dashboard > Products
2. Click each product
3. Copy the Price ID (starts with `price_`)

## 5. Deploy Edge Function

Deploy the Edge Function to Supabase:

```bash
supabase functions deploy create-checkout-session
```

## 6. Test Locally (Optional)

To test the Edge Function locally:

```bash
supabase start
supabase functions serve
```

## How It Works

1. **Landing Page**: User clicks "Subscribe Now" button
2. **Navigate to Pricing**: Button takes them to PricingPage
3. **Choose Plan**: User clicks their preferred plan button
4. **Edge Function Called**: PricingPage calls Supabase Edge Function with price ID
5. **Create Session**: Edge Function creates Stripe checkout session
6. **Redirect to Stripe**: User redirected to Stripe checkout
7. **Complete Payment**: After payment, user redirected back to your app

## Success/Cancel URLs

Currently set to redirect to your app root with query parameters:
- Success: `?success=true`
- Cancel: `?canceled=true`

You can customize these in `supabase/functions/create-checkout-session/index.ts`

## Troubleshooting

### "stripe is undefined" error
This has been fixed! The button now navigates to the pricing page instead of calling a non-existent API.

### "CORS error"
Make sure the Edge Function is deployed and `DOMAIN` environment variable matches your app URL.

### "Stripe API key not found"
Ensure you've added the `STRIPE_SECRET_KEY` environment variable to Supabase.

## File Changes

- ✅ `supabase/functions/create-checkout-session/index.ts` - New Edge Function
- ✅ `supabase/functions/_shared/cors.ts` - Shared CORS headers
- ✅ `src/App.tsx` - Added pricing navigation handler
- ✅ `src/components/Landing.tsx` - Removed broken API call, added pricing button
- ✅ `src/components/PricingPage.tsx` - Updated to use Edge Function
