import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  plugins: [
    // dev時のみCloudflare Workersプラグインを使用（Pagesデプロイ時は不要）
    ...(isDev ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});