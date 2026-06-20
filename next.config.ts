import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LOCAL_AI_PROVIDER: process.env.LOCAL_AI_PROVIDER || "ollama",
    NEXT_PUBLIC_OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
    NEXT_PUBLIC_OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2:3b",
    NEXT_PUBLIC_LOCAL_AI_SIMULATED: process.env.LOCAL_AI_SIMULATED || "false",
    NEXT_PUBLIC_LOCAL_AI_API_KEY: process.env.LOCAL_AI_API_KEY || "",
  }
};

export default nextConfig;
