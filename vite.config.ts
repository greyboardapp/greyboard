import { defineConfig } from "vite";
import { fromEnv } from "@gergoszaszvaradi/vite-env";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import { comlink } from "vite-plugin-comlink";

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            comlink(),
            solidPlugin(),
            solidSvg({
                defaultExport: "component",
                svgo: {
                    svgoConfig: {
                        plugins: {
                            cleanupIds: false,
                        }
                    }
                }
            }),
        ],
        worker: {
            plugins: [
                comlink(),
            ],
        },
        server: {
            port: 3000,
        },
        build: {
            target: "esnext",
            emptyOutDir: true,
            assetsDir: "."
        },
        define: fromEnv({ mode }),
    };
});
