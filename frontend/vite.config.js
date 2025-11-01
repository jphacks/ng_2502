import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React関連を1つのチャンクに
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Chakra UIを別のチャンクに
          "chakra-ui": [
            "@chakra-ui/react",
            "@emotion/react",
            "@emotion/styled",
            "framer-motion",
          ],
          // Firebaseを別のチャンクに
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          // その他のライブラリ
          utils: ["axios"],
        },
      },
    },
    // チャンクサイズ警告の閾値を上げる（オプション）
    chunkSizeWarningLimit: 1000,
  },
});
