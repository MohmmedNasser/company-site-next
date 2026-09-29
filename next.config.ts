import { fileURLToPath } from "node:url";
import path from "node:path";
import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Pins Turbopack's workspace root to this project explicitly. Without this,
// Turbopack walks up the directory tree looking for lockfiles and finds an
// unrelated package-lock.json directly in C:\Users\HP (the user's home
// directory, not part of this project) before it reaches this project's own
// pnpm-workspace.yaml — picking the wrong directory as root breaks every
// relative import resolution (observed: "Can't resolve '../styles/
// palette.css'", "Cannot find module 'next-intl'"). Setting root explicitly
// is the fix Next.js itself recommends over deleting files outside this
// project.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// The Laravel API serves uploaded images from its own /storage path, so its
// origin must be allowed in next/image. Derived from NEXT_PUBLIC_API_URL so
// local (http://company-site-api.test) and production hosts both work
// without hardcoding either.
function apiImagePattern(): RemotePattern[] {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  const { protocol, hostname, port } = new URL(apiUrl);
  return [
    {
      protocol: protocol === "https:" ? "https" : "http",
      hostname,
      port,
      pathname: "/storage/**",
    },
  ];
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    // picsum.photos is a placeholder photography source for the Services
    // section only (see docs/design-decisions.md) — swap for real asset
    // hosting once real photography is supplied.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      ...apiImagePattern(),
    ],
    // Local Herd/Valet hosts (*.test) resolve to 127.0.0.1, which Next 16's
    // image optimizer blocks as a private IP. Dev only — never in production.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default withNextIntl(nextConfig);
