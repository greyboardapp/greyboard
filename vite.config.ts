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
                svgo: {
                    svgoConfig: {
                        plugins: {
                            cleanupIds: false,
                        }
                    }
                }
            }),
        ],
        server: {
            port: 3000,
            proxy: {
                "/api": "http://localhost:8788"
            }
        },
        build: {
            target: "esnext",
            emptyOutDir: true,
            assetsDir: "."
        },
        define: fromEnv({ mode }),
    };
});
