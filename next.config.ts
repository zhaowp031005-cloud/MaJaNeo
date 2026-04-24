import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: (() => {
    const raw = process.env["SUPABASE_URL"];
    if (!raw) return undefined;
    const hostname = new URL(raw).hostname;
    return {
      remotePatterns: [
        {
          protocol: "https",
          hostname,
          pathname: "/storage/v1/object/**",
        },
      ],
    };
  })(),
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
