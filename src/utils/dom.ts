export function px(value : number) : string {
    return `${value}px`;
}

export function cls(...classes : string[]) : string {
    return classes.join(" ");
}
