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

declare interface ImportMeta {
    env : {
        BASE_URL : string;
        DEBUG ?: string;
        LOG_LEVEL ?: number;
    }
}
