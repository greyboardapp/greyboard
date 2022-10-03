export function px(value : number) : string {
    return `${value}px`;
}

export function cls(...classes : (string | undefined)[]) : string {
    return classes.filter((c) => c).join(" ");
}
