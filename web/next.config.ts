import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Yerel embedding modeli native ONNX kullanır; paketlenmemeli.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  cacheComponents: true,
  experimental: { serverActions: { bodySizeLimit: "6mb" } }, // CV yükleme (en fazla 5 MB)
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
