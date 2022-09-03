import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { fromEnv } from "@gergoszaszvaradi/vite-env";

export default defineConfig(({ mode }) => {
    return {
        plugins: [solidPlugin()],
        server: {
            port: 3000,
        },
        build: {
            target: "esnext",
        },
        define: fromEnv({ mode }),
    };
});
