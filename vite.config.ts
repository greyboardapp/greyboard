import { defineConfig } from "vite";
import { fromEnv } from "@gergoszaszvaradi/vite-env";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            solidPlugin(),
            solidSvg({
                defaultExport: "component",
            }),
        ],
        server: {
            port: 3000,
        },
        build: {
            target: "esnext",
        },
        define: fromEnv({ mode }),
    };
});
