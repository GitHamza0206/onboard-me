// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),          //  <--  alias unique
    },
  },
  server: {
    // Écoute sur toutes les interfaces réseau (nécessaire pour Docker)
    host: '0.0.0.0',

    // Autorise l'accès depuis votre nom de domaine
    allowedHosts: ['onboardme.fr'],

    // Recommandé pour que le Hot-Reload fonctionne derrière un proxy
    watch: {
      usePolling: true
    }
  }
});
