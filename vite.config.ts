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

  // Build optimization for code splitting and performance
  build: {
    // Increase chunk size warning limit to 800kb (from default 500kb)
    chunkSizeWarningLimit: 800,

    // Enable source maps for production debugging (optional)
    sourcemap: mode === 'production' ? false : true,

    // Minification settings
    minify: mode === 'production' ? 'esbuild' : false,

    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and loading performance
        manualChunks: {
          // React core and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI components and styling
          'ui-vendor': ['@radix-ui/react-slot', '@radix-ui/react-dialog', 'class-variance-authority', 'clsx'],

          // Date and utility libraries
          'utils-vendor': ['date-fns', 'lucide-react'],

          // Admin panel components (loaded only when needed)
          'admin': [
            './src/components/admin/BookingsSection.tsx',
            './src/components/admin/RoomsSection.tsx',
            './src/components/admin/PackagesSection.tsx',
            './src/components/admin/AmenitiesSection.tsx',
            './src/pages/admin/AdminPanel.tsx'
          ],

          // Booking flow components
          'booking': [
            './src/pages/user/Booking.tsx',
            './src/pages/user/BookingSummary.tsx',
            './src/components/BookingSteps.tsx'
          ]
        },

        // Generate different file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') ?? 'chunk'
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    }
  }
}));
