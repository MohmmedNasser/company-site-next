import { fileURLToPath } from "node:url";
import path from "node:path";
import type { NextConfig } from "next";
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

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default withNextIntl(nextConfig);
