export function px(value : number) : string {
    return `${value}px`;
}

export function pct(value : number, relative = true) : string {
    return `${relative ? value * 100 : value}%`;
}

export function rgba(values : [number, number, number, number]) : string {
    return `rgba(${values.join(",")})`;
}

export function cls(...classes : (string | undefined)[]) : string {
    return classes.filter((c) => c).join(" ");
}
