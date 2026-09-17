import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default 1MB terlalu kecil untuk unggah referensi PDF (hingga 20MB)
      // dan naskah (.docx/.md, hingga 20MB).
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
