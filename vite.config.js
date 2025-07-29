import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
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
            './src/adminPage/pages/User'
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
})