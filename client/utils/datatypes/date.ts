export function getMidnightAfterDays(original : number, days : number) : Date {
    const date = new Date(original * 1000);
    date.setDate(date.getUTCDate() + 1 + days);
    date.setHours(0, 0, 0, 0);
    return date;
}
