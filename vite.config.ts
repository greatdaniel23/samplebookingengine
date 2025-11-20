import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    // No host binding - use Vite defaults
    port: 5173,
    // No proxy needed - always use production API directly
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Strip all console statements from production build output.
  // This uses esbuild's drop option; source remains unchanged for development.
  esbuild: mode === 'production' ? { drop: ['console'] } : undefined,
}));
