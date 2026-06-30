import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = process.env.GITHUB_PAGES_BASE_PATH ?? "/FutureGrid";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? githubPagesBasePath : undefined,
  trailingSlash: isGitHubPages,
};

export default nextConfig;