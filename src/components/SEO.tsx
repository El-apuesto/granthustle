// src/components/SEO.tsx
import React from "react";
import Head from "next/head"; // if using Next.js; otherwise use standard <head> placement
// If not using Next.js, render tags at top-level of your document head via your framework's head API.

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  siteName?: string;
  twitter?: string;
  jsonLd?: Record<string, any> | null;
}

export default function SEO({
  title = "Grant Geenie — A ticket to a whole new world",
  description = "Grant Geenie finds grants tailored to your project. 5 free matches/month. No nonsense. No bureaucracy.",
  url = "https://www.YOUR_DOMAIN_HERE.com",
  image = "https://www.YOUR_DOMAIN_HERE.com/og-image.png",
  siteName = "Grant Geenie",
  twitter = "@your_twitter_handle",
  jsonLd = null,
}: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitter} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Head>
  );
}
