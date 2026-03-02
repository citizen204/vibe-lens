import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 指定 Turbopack 工作区根目录，消除多 lockfile 警告
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
