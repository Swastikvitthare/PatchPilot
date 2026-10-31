/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  // If building for GitHub Pages, export static HTML and unoptimize images
  ...(isGithubPages ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  basePath: isGithubPages ? "/patchpilot" : "",
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  },
};

export default nextConfig;
