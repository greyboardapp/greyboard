/// <reference types="vite-plugin-comlink/client" />

declare module "*.css" {
    const styles : { readonly [key : string] : string };
    export default styles;
}

declare module "*.scss" {
    const styles : { readonly [key : string] : string };
    export default styles;
}

declare module "*.svg" {
    import type { Component, ComponentProps } from "solid-js";
    const c: Component<ComponentProps<"svg">>;
    export default c;
}

declare module "*?url" {
    const url : string;
    export default url;
}

declare interface ImportMeta {
    env : {
        BASE_URL : string;
        HUB_URL : string;
        DEBUG ?: string;
        LOG_LEVEL ?: number;
        BOARD_SAVE_INTERVAL : number;

        GOOGLE_AUTH_CLIENT_ID : string;
        GITHUB_AUTH_CLIENT_ID : string;
    }
}
