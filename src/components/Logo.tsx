// src/components/Logo.tsx
import React from "react";

interface LogoProps {
  size?: number; // px
  imageSrc?: string | null; // optional custom image URL or import
  alt?: string;
}

export default function Logo({ size = 48, imageSrc = null, alt = "GrantHustle" }: LogoProps) {
  const dim = `${size}px`;
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        style={{ width: dim, height: dim, objectFit: "contain" }}
        className="rounded-md"
      />
    );
  }

  // Default SVG mark (simple modern monogram + mark)
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label={alt} role="img">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#10B981" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <rect rx="12" width="64" height="64" fill="url(#g1)" />
      <g transform="translate(8, 8)">
        <path d="M8 32 L24 8 L40 32 Z" fill="rgba(255,255,255,0.95)" opacity="0.95" />
        <circle cx="24" cy="20" r="3.5" fill="#0f172a" />
      </g>
    </svg>
  );
}
