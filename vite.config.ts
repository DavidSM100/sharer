import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
// @ts-expect-error
import { buildXDC, mockWebxdc, eruda } from "@webxdc/vite-plugins";

// https://vite.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    reportCompressedSize: false,
  },
  plugins: [svelte(), buildXDC(), eruda(), mockWebxdc()],
});
