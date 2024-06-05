import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";


export default defineConfig({
    plugins: [glsl()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
});
