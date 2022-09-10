declare module "*.css" {
    const styles : { readonly [key : string] : string };
    export default styles;
}

declare module "*.scss" {
    const styles : { readonly [key : string] : string };
    export default styles;
}


declare interface ImportMeta {
    env : {
        BASE_URL : string;
        DEBUG ?: string;
    }
}