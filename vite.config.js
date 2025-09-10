import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Set NODE_ENV based on the mode
  const isProduction = mode === 'production';
  
  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    plugins: [
      react({
        // This will enable JSX in .js files
        include: /\.[jt]sx?$/,
      }), 
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    // Load environment variables from .env files
    envDir: '.',
    build: {
      // Use esbuild minifier to avoid optional terser dependency
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 1000, // Increase chunk size warning limit (in kB)
      rollupOptions: {
        output: {
          manualChunks: {
            // Group vendor modules into separate chunks
            react: ['react', 'react-dom', 'react-router-dom'],
            // Group admin-related components
            admin: [
              './src/adminPage/pages/AdminDashboard',
              './src/adminPage/pages/Agent',
              './src/adminPage/pages/Inquiries',
              './src/adminPage/pages/Properties',
              './src/adminPage/pages/Profile',
              './src/adminPage/pages/Reviews',
              './src/adminPage/pages/Settings',
              './src/adminPage/pages/User',
              './src/adminPage/pages/Appointments'
            ],
            // Group user-related components
            user: [
              './src/userPage/user-page/UserDashboard',
              './src/userPage/user-page/SavedProperties',
              './src/userPage/user-page/ViewingHistory',
              './src/userPage/user-page/Appointment',
              './src/userPage/user-page/Notification',
              './src/userPage/user-page/Settings'
            ]
          },
        },
      },
    },
    server: {
      port: 5137,
      open: true,
      proxy: {
        '/api': {
          target: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_PROXY_TARGET) || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    preview: {
      port: 5137,
      open: true,
    },
  };
});