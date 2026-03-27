/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling pdf-parse and its pdfjs dependency
      // pdfjs-dist requires browser APIs (DOMMatrix) that don't exist in Node.js
      config.externals = config.externals || [];
      config.externals.push({
        "pdf-parse": "commonjs pdf-parse",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
