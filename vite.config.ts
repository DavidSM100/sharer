import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
// @ts-expect-error
import { buildXDC, mockWebxdc, eruda } from "@webxdc/vite-plugins";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [tailwindcss(), svelte(), buildXDC(), eruda(), mockWebxdc()],
});
