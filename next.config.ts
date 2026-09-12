import type { NextConfig } from "next";

// Derived from the Supabase project URL rather than hardcoded, so this
// keeps working automatically if the project is ever migrated/recreated.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "zllogvcvfdzudthlsewt.supabase.co";

const nextConfig: NextConfig = {
  images: {
    // Lets next/image optimize photos the admin panel uploads to Supabase
    // Storage (gallery projects, blog covers, about/homepage photo, a
    // custom logo) — those are public buckets served from this exact
    // path, so it's safe to scope the pattern this tightly rather than
    // allowing the whole supabase.co domain.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
